import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
/*eslint import/namespace: [0, {allowComputed: true}]*/
import sinon, { stubObject } from 'ts-sinon';

import { EnvironmentVariables, IEnvironmentVariables } from '@/config';
import { SpotifyService } from '@/spotify';
import { ISpotifyService } from '@/spotify/SpotifyService';
import {
  Dependencies,
  InternalDependencies,
  MessageProcessor,
} from '@/twitch/MessageProcessor/MessageProcessor';
import { Logger, MessageUtils } from '@/utils';

chai.use(sinonChai);

describe('MessageProcessor', async () => {
  const spotifyServiceStub = stubObject<ISpotifyService>(new SpotifyService());
  const environmentVariablesStub = stubObject<IEnvironmentVariables>(
    EnvironmentVariables
  );
  const loggerStub = stubObject<typeof Logger>(Logger);
  const messageUtilsStub = stubObject(MessageUtils);

  const notifyChatStub = sinon.stub();

  const dependencies: Dependencies = {
    spotifyService: spotifyServiceStub,
    notifyChat: notifyChatStub,
  };

  const internalDependencies: InternalDependencies = {
    environmentVariables: environmentVariablesStub,
    logger: loggerStub,
    messageUtils: messageUtilsStub,
  };

  afterEach(async () => {
    sinon.resetHistory();
    sinon.reset();
  });

  describe('on a message', async () => {
    describe('filter message', async () => {
      it('should not do anything if the message is from itself', async () => {
        await MessageProcessor(
          dependencies,
          internalDependencies
        ).processMessage('TestTarget', {}, 'Test message', true);

        expect(notifyChatStub).to.not.be.called;
        expect(spotifyServiceStub.addTrack).to.not.be.called;
        expect(loggerStub.trace).to.be.calledWith('Message received from self');
      });

      it('should not do anything if the command prefix is not set', async () => {
        await MessageProcessor(
          dependencies,
          internalDependencies
        ).processMessage('TestTarget', {}, 'Test message', false);

        expect(notifyChatStub).to.not.be.called;
        expect(spotifyServiceStub.addTrack).to.not.be.called;
        expect(loggerStub.trace).to.be.calledWith(
          'Message received but it did not start with the command prefix'
        );
      });

      it('should not do anything if the message does not start with the prefix', async () => {
        environmentVariablesStub.COMMAND_PREFIX = '!COMMAND';

        await MessageProcessor(
          dependencies,
          internalDependencies
        ).processMessage('TestTarget', {}, 'Test message', false);

        expect(notifyChatStub).to.not.be.called;
        expect(spotifyServiceStub.addTrack).to.not.be.called;
        expect(loggerStub.trace).to.be.calledWith(
          'Message received but it did not start with the command prefix'
        );
      });

      it('should not do anything if sub only mode is on and the message is not from a sub', async () => {
        environmentVariablesStub.COMMAND_PREFIX = '!COMMAND';
        environmentVariablesStub.SUBSCRIBERS_ONLY = true;

        await MessageProcessor(
          dependencies,
          internalDependencies
        ).processMessage(
          'TestTarget',
          { subscriber: false },
          '!COMMAND Test message',
          false
        );

        expect(notifyChatStub).to.not.be.called;
        expect(spotifyServiceStub.addTrack).to.not.be.called;
        expect(loggerStub.trace).to.be.calledWith(
          'Command received but it was not from a subscriber'
        );
      });
    });

    describe('process message', async () => {
      it('should notify when no Spotify link is provided', async () => {
        environmentVariablesStub.COMMAND_PREFIX = '!COMMAND';
        environmentVariablesStub.SUBSCRIBERS_ONLY = false;

        await MessageProcessor(
          dependencies,
          internalDependencies
        ).processMessage('TestTarget', {}, '!COMMAND Test message', false);

        expect(notifyChatStub).to.be.calledWith(
          'TestTarget',
          'Fail (no link): No Spotify link detected'
        );
        expect(spotifyServiceStub.addTrack).to.not.be.called;
        expect(loggerStub.log).to.be.calledWith(
          'Command used but no Spotify link provided'
        );
      });

      it('should call addTrack in the Spotify service when a valid link is passed', async () => {
        environmentVariablesStub.COMMAND_PREFIX = '!COMMAND';
        environmentVariablesStub.SUBSCRIBERS_ONLY = false;
        messageUtilsStub.startsWithSpotifyLink.returns(true);
        messageUtilsStub.getTrackIdFromLink.returns('areallink');

        await MessageProcessor(
          dependencies,
          internalDependencies
        ).processMessage('TestTarget', {}, '!COMMAND areallink', false);

        expect(spotifyServiceStub.addTrack).to.be.calledWith('areallink');
      });

      it('should call addTrack in the Spotify service when a valid link is passed by a sub while in sub only mode', async () => {
        environmentVariablesStub.COMMAND_PREFIX = '!COMMAND';
        environmentVariablesStub.SUBSCRIBERS_ONLY = true;
        messageUtilsStub.startsWithSpotifyLink.returns(true);
        messageUtilsStub.getTrackIdFromLink.returns('areallink');

        await MessageProcessor(
          dependencies,
          internalDependencies
        ).processMessage(
          'TestTarget',
          { subscriber: true },
          '!COMMAND areallink',
          false
        );

        expect(spotifyServiceStub.addTrack).to.be.calledWith('areallink');
      });

      it('should notify when an invalid link is passed', async () => {
        environmentVariablesStub.COMMAND_PREFIX = '!COMMAND';
        environmentVariablesStub.SUBSCRIBERS_ONLY = false;
        messageUtilsStub.startsWithSpotifyLink.returns(true);
        messageUtilsStub.getTrackIdFromLink.returns('invalidlink');
        spotifyServiceStub.addTrack.throws('Bleh');

        await MessageProcessor(
          dependencies,
          internalDependencies
        ).processMessage('TestTarget', {}, '!COMMAND invalidlink', false);

        expect(spotifyServiceStub.addTrack).to.be.calledWith('invalidlink');
        expect(notifyChatStub).to.be.calledWith(
          'TestTarget',
          'Fail (invalid message): Unable to parse track ID from message'
        );
      });
    });
  });
});
