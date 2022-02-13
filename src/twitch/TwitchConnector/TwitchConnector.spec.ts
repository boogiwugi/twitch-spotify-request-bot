import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import * as tmi from 'tmi.js';
import { Client } from 'tmi.js';
/*eslint import/namespace: [0, {allowComputed: true}]*/
import sinon, { stubObject } from 'ts-sinon';

import { EnvironmentVariables, IEnvironmentVariables } from '@/config';
import { SpotifyService } from '@/spotify';
import { ISpotifyService } from '@/spotify/SpotifyService';
import { Logger, MessageUtils } from '@/utils';

import TwitchConnector, {
  Dependencies,
  InternalDependencies,
} from './TwitchConnector';

chai.use(sinonChai);

describe('TwitchConnector', async () => {
  const spotifyServiceStub = stubObject<ISpotifyService>(new SpotifyService());
  const tmiStub = stubObject<typeof tmi>(tmi);
  const environmentVariablesStub = stubObject<IEnvironmentVariables>(
    EnvironmentVariables
  );
  const logger = sinon.spy(Logger);
  const messageUtilsStub = stubObject(MessageUtils);

  const clientStub = stubObject(new Client({}));
  const chatStub = sinon.stub();

  const dependencies: Dependencies = {
    spotifyService: spotifyServiceStub,
  };

  const internalDependencies: InternalDependencies = {
    tmi: tmiStub,
    environmentVariables: environmentVariablesStub,
    logger: logger,
    messageUtils: messageUtilsStub,
    chatInteractor: chatStub,
  };

  afterEach(async () => {
    sinon.resetHistory();
  });

  describe('on creation', async () => {
    it('should connect with basic options when chat feedback is not enabled', async () => {
      environmentVariablesStub.CHAT_FEEDBACK = false;
      environmentVariablesStub.TWITCH_CHANNEL = 'ABC123';

      clientStub.on.returns();
      tmiStub.Client.returns(clientStub);

      await TwitchConnector(dependencies, internalDependencies);

      expect(tmiStub.Client).to.be.calledOnceWithExactly({
        channels: ['ABC123'],
      });
    });

    it('should connect with chat options when chat feedback is enabled', async () => {
      environmentVariablesStub.CHAT_FEEDBACK = true;
      environmentVariablesStub.TWITCH_CHANNEL = 'ABC123';
      environmentVariablesStub.BOT_USERNAME = 'USERNAME';
      environmentVariablesStub.TWITCH_TOKEN = 'TOKEN';

      clientStub.on.returns();
      tmiStub.Client.returns(clientStub);

      await TwitchConnector(dependencies, internalDependencies);

      expect(tmiStub.Client).to.be.calledOnceWithExactly({
        channels: ['ABC123'],
        identity: {
          username: 'USERNAME',
          password: 'TOKEN',
        },
      });
    });

    it('should error when chat feedback is enabled but no config provided', async () => {
      environmentVariablesStub.CHAT_FEEDBACK = true;
      environmentVariablesStub.TWITCH_CHANNEL = 'ABC123';
      environmentVariablesStub.BOT_USERNAME = undefined;
      environmentVariablesStub.TWITCH_TOKEN = undefined;
      try {
        await TwitchConnector(dependencies, internalDependencies);
      } catch (e) {
        expect(tmiStub.Client).to.not.be.called;
        expect(logger.error).to.be.calledOnceWithExactly(
          'Error: Chat feedback enabled but there is no TWITCH_TOKEN or BOT_USERNAME in the config'
        );
      }
    });

    it('should error when an error occurs while connecting', async () => {
      environmentVariablesStub.CHAT_FEEDBACK = false;
      environmentVariablesStub.TWITCH_CHANNEL = 'ABC123';

      clientStub.connect.throws(new Error('unknown error'));
      tmiStub.Client.returns(clientStub);

      try {
        await TwitchConnector(dependencies, internalDependencies);
      } catch (e) {
        expect(tmiStub.Client).to.be.calledOnceWithExactly({
          channels: ['ABC123'],
        });
        expect(logger.error).to.be.calledOnceWithExactly(
          'Error connecting to Twitch - Error: unknown error'
        );
      }
    });
  });
});
