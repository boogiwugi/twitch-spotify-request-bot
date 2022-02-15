import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
/*eslint import/namespace: [0, {allowComputed: true}]*/
import { Client } from 'tmi.js';
import sinon, { stubObject } from 'ts-sinon';

import { EnvironmentVariables, IEnvironmentVariables } from '@/config';
import {
  ChatInteractor,
  Dependencies,
  InternalDependencies,
} from '@/twitch/ChatInteractor/ChatInteractor';
import { Logger } from '@/utils';

chai.use(sinonChai);
describe('ChatInteractor', async () => {
  const environmentVariablesStub = stubObject<IEnvironmentVariables>(
    EnvironmentVariables
  );
  const loggerStub = stubObject<typeof Logger>(Logger);
  const twitchClientStub = stubObject<Client>(Client({}));

  const dependencies: Dependencies = {
    twitchClient: twitchClientStub,
  };

  const internalDependencies: InternalDependencies = {
    environmentVariables: environmentVariablesStub,
    logger: loggerStub,
  };

  afterEach(async () => {
    sinon.resetHistory();
    sinon.reset();
  });

  describe('send', async () => {
    it('should send a message when chat feedback is enabled', async () => {
      environmentVariablesStub.CHAT_FEEDBACK = true;

      await ChatInteractor(dependencies, internalDependencies).send(
        'target',
        'the message'
      );

      expect(twitchClientStub.say).to.be.calledOnceWithExactly(
        'target',
        'the message'
      );
    });

    it('should not send a message when chat feedback is disabled', async () => {
      environmentVariablesStub.CHAT_FEEDBACK = false;

      await ChatInteractor(dependencies, internalDependencies).send(
        'target',
        'the message'
      );
      expect(twitchClientStub.say).to.not.be.called;
    });
  });
});
