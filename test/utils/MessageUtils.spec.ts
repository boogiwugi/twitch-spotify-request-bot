import { expect } from 'chai';
import { MessageUtils } from '@/utils';

const { getTrackIdFromLink, startsWithSpotifyLink } = MessageUtils;

describe('getTrackIdFromLink', async () => {
  it('should return track ID when a valid link without query params is passed in', async () => {
    const validSpotifyLink =
      'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT';

    const result = getTrackIdFromLink(validSpotifyLink);

    expect(result).to.equal('4cOdK2wGLETKBW3PvgPWqT');
  });

  it('should return track ID when a valid link with query params is passed in', async () => {
    const validSpotifyLink =
      'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=e507b989ec794332';

    const result = getTrackIdFromLink(validSpotifyLink);

    expect(result).to.equal('4cOdK2wGLETKBW3PvgPWqT');
  });

  it('should throw error when an invalid link is passed in', async () => {
    const invalidSpotifyLink = 'https://open.spotify.com/track/';

    expect(() => getTrackIdFromLink(invalidSpotifyLink)).to.throw(
      'No track ID found in URL'
    );
  });
});

describe('startsWithSpotifyLink', async () => {
  it('should return true when message starts with a Spotify link', async () => {
    expect(
      startsWithSpotifyLink(
        'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=e507b989ec794332'
      )
    ).to.be.true;
  });

  it('should return false when message does not start with a Spotify link', async () => {
    expect(startsWithSpotifyLink('https://www.google.com')).to.be.false;
  });
});
