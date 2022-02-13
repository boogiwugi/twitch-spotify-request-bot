import { ChatUserstate } from 'tmi.js';

import { EnvironmentVariables } from '@/config';
import { ISpotifyService } from '@/spotify/SpotifyService';
import { Logger as __logger, MessageUtils as __messageUtils } from '@/utils';

const DefaultInternalDependencies = {
  environmentVariables: EnvironmentVariables,
  logger: __logger,
  messageUtils: __messageUtils,
};

export interface IMessageProcessor {
  processMessage: (
    target: string,
    userState: ChatUserstate,
    msg: string,
    self: boolean
  ) => Promise<void>;
}

export interface Dependencies {
  spotifyService: ISpotifyService;
  notifyChat: (target: string, message: string) => Promise<void>;
}

export type InternalDependencies = typeof DefaultInternalDependencies;

export const MessageProcessor = (
  { spotifyService, notifyChat }: Dependencies,
  {
    environmentVariables,
    logger,
    messageUtils,
  }: InternalDependencies = DefaultInternalDependencies
): IMessageProcessor => {
  const { COMMAND_PREFIX, SUBSCRIBERS_ONLY } = environmentVariables;

  const processMessage = async (
    target: string,
    userState: ChatUserstate,
    msg: string,
    self: boolean
  ) => {
    if (self) {
      logger.trace('Message received from self');
      return;
    }

    if (COMMAND_PREFIX && msg.startsWith(COMMAND_PREFIX)) {
      if (SUBSCRIBERS_ONLY) {
        if (!userState.subscriber) {
          logger.trace('Command received but it was not from a subscriber');
          return;
        }
      }

      logger.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      msg = msg.substring(`${COMMAND_PREFIX} `.length);
      if (messageUtils.startsWithSpotifyLink(msg)) {
        await handleSpotifyLink(msg, target);
      } else {
        logger.log('Command used but no Spotify link provided');
        await notifyChat(target, 'Fail (no link): No Spotify link detected');
      }
      logger.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    } else {
      logger.trace(
        'Message received but it did not start with the command prefix'
      );
    }
  };

  const handleSpotifyLink = async (message: string, target: string) => {
    try {
      const trackId = messageUtils.getTrackIdFromLink(message);
      await spotifyService.addTrack(trackId, (chatMessage) => {
        notifyChat(target, chatMessage);
      });
    } catch (e) {
      logger.error('Unable to parse track ID from message');
      await notifyChat(
        target,
        'Fail (invalid message): Unable to parse track ID from message'
      );
    }
  };

  return {
    processMessage,
  };
};
