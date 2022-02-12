import { Client } from 'tmi.js';

import { EnvironmentVariables } from '@/config';
import { Logger as __logger } from '@/utils';

const DefaultInternalDependencies = {
  environmentVariables: EnvironmentVariables,
  logger: __logger,
};

export interface IChatInteractor {
  send: (target: string, message: string) => Promise<void>;
}

export interface Dependencies {
  twitchClient: Client;
}

export type InternalDependencies = typeof DefaultInternalDependencies;

export const ChatInteractor = (
  { twitchClient }: Dependencies,
  {
    environmentVariables,
    logger,
  }: InternalDependencies = DefaultInternalDependencies
): IChatInteractor => {
  const send = async (target: string, message: string) => {
    logger.debug(
      `chatFeedback called with "${message}"\nCHAT_FEEDBACK is set to ${environmentVariables.CHAT_FEEDBACK}`
    );

    if (environmentVariables.CHAT_FEEDBACK) {
      await twitchClient.say(target, message);
    }
  };

  return {
    send,
  };
};
