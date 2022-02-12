import * as __tmi from 'tmi.js';
import { Client } from 'tmi.js';

import { EnvironmentVariables } from '@/config';
import { ISpotifyService } from '@/spotify/SpotifyService';
import { MessageProcessor } from '@/twitch/MessageProcessor/MessageProcessor';
import { Logger as __logger, MessageUtils as __messageUtils } from '@/utils';

import { ChatInteractor as __chatInteractor } from '../ChatInteractor/ChatInteractor';

interface TwitchOptions {
  channels: string[];
  identity?: {
    username: string;
    password: string;
  };
}

const DefaultInternalDependencies = {
  tmi: __tmi,
  environmentVariables: EnvironmentVariables,
  logger: __logger,
  messageUtils: __messageUtils,
  chatInteractor: __chatInteractor,
};

export type InternalDependencies = typeof DefaultInternalDependencies;
export interface Dependencies {
  spotifyService: ISpotifyService;
}

export const TwitchConnector = async (
  { spotifyService }: Dependencies,
  {
    tmi,
    environmentVariables,
    logger,
    chatInteractor,
  }: InternalDependencies = DefaultInternalDependencies
) => {
  const {
    CHAT_FEEDBACK,
    TWITCH_TOKEN,
    BOT_USERNAME,
    TWITCH_CHANNEL,
  } = environmentVariables;
  let twitchClient: Client;

  const connectToChat = async () => {
    const twitchOptions = constructTwitchOptions();
    twitchClient = tmi.Client(twitchOptions);

    twitchClient.on('connected', () =>
      logger.log(`Connected to ${environmentVariables.TWITCH_CHANNEL}'s chat`)
    );

    const messageProcessor = MessageProcessor({ spotifyService, notifyChat });

    twitchClient.on('message', messageProcessor.processMessage);

    try {
      await twitchClient.connect();
    } catch (e) {
      logger.error(`Error connecting to Twitch - ${e}`);
      throw e;
    }
  };

  const constructTwitchOptions = (): TwitchOptions => {
    let twitchOptions: TwitchOptions = {
      channels: [TWITCH_CHANNEL],
    };

    if (CHAT_FEEDBACK) {
      if (TWITCH_TOKEN && BOT_USERNAME) {
        twitchOptions = {
          ...twitchOptions,
          identity: {
            username: BOT_USERNAME,
            password: TWITCH_TOKEN,
          },
        };
      } else {
        logger.error(
          'Error: Chat feedback enabled but there is no TWITCH_TOKEN or BOT_USERNAME in the config'
        );
        throw new Error(
          'Chat feedback enabled but there is no TWITCH_TOKEN or BOT_USERNAME in the config'
        );
      }
    }

    return twitchOptions;
  };

  const notifyChat = async (target: string, message: string) => {
    await chatInteractor({ twitchClient }).send(target, message);
  };

  await connectToChat();
};

export default TwitchConnector;
