import express from 'express';

import { EnvironmentVariables } from '@/config';
import { SpotifyService } from '@/spotify';

const AUTH_SERVER_PORT =
  process.env.PORT || EnvironmentVariables.AUTH_SERVER_PORT;

export const waitForCode = (onCodeReceived: (code: string) => void) => {
  const app = express();
  const port = AUTH_SERVER_PORT;

  const server = app.listen(port, () => {
    return console.log(`Auth server is listening on ${port}`);
  });

  app.get('/', (req, res) => {
    const spotifyService = new SpotifyService();
    const authURL = spotifyService.getAuthorizationUrl();
    res.redirect(authURL);
  });
  app.get('/spotifyAuth', (req, res) => {
    res.send('Authorization received, you can close this window now.');
    server.close();
    onCodeReceived(req.query.code as string);
  });
};
