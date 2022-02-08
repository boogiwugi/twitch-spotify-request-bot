describe.skip('connectToChat', async () => {
  it('should connect with basic options when chat feedback is not enabled', async () => {});
  it('should connect with chat options when chat feedback is enabled', async () => {});
  it('should panic when chat feedback is enabled but no config provided', async () => {});
  it('should panic when an error occurs while connecting', async () => {});
});

describe.skip('handleMessage', async () => {
  describe('filter message', async () => {
    it('should not do anything if the message is from itself', async () => {});
    it('should not do anything if the command prefix is not set', async () => {});
    it('should not do anything if the message does not start with the prefix', async () => {});
    it('should not do anything if sub only mode is on and the message is not from a sub', async () => {});
  });

  describe('process message', async () => {
    it('should notify when no Spotify link is provided', async () => {});
    it('should call addTrack in the Spotify service when a valid link is passed', async () => {});
    it('should notify when an invalid link is passed', async () => {});
  });
});

describe.skip('chatFeedback', async () => {
  it('should do nothing if chat feedback is not enabled', async () => {});
  it('should message in chat if chat feedback is enabled', async () => {});
});
