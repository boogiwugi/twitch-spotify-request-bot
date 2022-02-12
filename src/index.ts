import * as path from 'path';

import { SpotifyService } from '@/spotify';
import { TwitchConnector } from '@/twitch';

// Required for pkg to recognise these files as assets
path.join(__dirname, '../.env');
path.join(__dirname, '../.env.types');

const runApp = async () => {
  const spotifyService = new SpotifyService();
  await spotifyService
    .authorize(async () => {
      await TwitchConnector({ spotifyService });
    })
    .catch((reason) => {
      console.error(`Unable to authorize with spotify: ${reason}`);
    });
};

runApp().then();
