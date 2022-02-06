import path from 'path';

import env from 'env-smart';

import 'dotenv/config';

export const envDirectory = path.join(__dirname, '..');

env.load({ directory: envDirectory });

const {
  TWITCH_CHANNEL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_PLAYLIST_ID,
  TWITCH_TOKEN,
  BOT_USERNAME,
  CHAT_FEEDBACK,
  ADD_TO_QUEUE,
  ADD_TO_PLAYLIST,
  SUBSCRIBERS_ONLY,
  COMMAND_PREFIX,
  AUTH_SERVER_PORT,
  HOST,
} = process.env;

export interface IEnvironmentVariables {
  TWITCH_CHANNEL: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_PLAYLIST_ID?: string;
  TWITCH_TOKEN: string;
  BOT_USERNAME: string;
  CHAT_FEEDBACK: boolean;
  ADD_TO_QUEUE: boolean;
  ADD_TO_PLAYLIST: boolean;
  SUBSCRIBERS_ONLY: boolean;
  COMMAND_PREFIX: string;
  AUTH_SERVER_PORT: number;
  HOST: string;
}

// Trusting that the env file has the correct types and casting based on that
export const EnvironmentVariables: IEnvironmentVariables = {
  TWITCH_CHANNEL: TWITCH_CHANNEL as string,
  SPOTIFY_CLIENT_ID: SPOTIFY_CLIENT_ID as string,
  SPOTIFY_CLIENT_SECRET: SPOTIFY_CLIENT_SECRET as string,
  SPOTIFY_PLAYLIST_ID,
  TWITCH_TOKEN: TWITCH_TOKEN as string,
  BOT_USERNAME: BOT_USERNAME as string,
  CHAT_FEEDBACK: (CHAT_FEEDBACK as unknown) as boolean,
  ADD_TO_QUEUE: (ADD_TO_QUEUE as unknown) as boolean,
  ADD_TO_PLAYLIST: (ADD_TO_PLAYLIST as unknown) as boolean,
  SUBSCRIBERS_ONLY: (SUBSCRIBERS_ONLY as unknown) as boolean,
  COMMAND_PREFIX: COMMAND_PREFIX as string,
  AUTH_SERVER_PORT: (AUTH_SERVER_PORT as unknown) as number,
  HOST: HOST as string,
};
