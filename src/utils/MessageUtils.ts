const SPOTIFY_LINK_START = 'https://open.spotify.com/track/';

export const getTrackIdFromLink = (link: string): string => {
  if (link.length > SPOTIFY_LINK_START.length) {
    const startOfId = SPOTIFY_LINK_START.length;
    const endOfId = link.indexOf('?');
    if (endOfId > 0) {
      return link.substring(startOfId, endOfId);
    } else {
      return link.substring(startOfId);
    }
  }

  throw Error('No track ID found in URL');
};

export const startsWithSpotifyLink = (message: string): boolean => {
  return message.startsWith(SPOTIFY_LINK_START);
};
