import { ChatUserstate, Client, ClientConstructor } from 'tmi.js';

import { EnvironmentVariables, IEnvironmentVariables } from '@/config';
import { ISpotifyService } from '@/spotify/SpotifyService';
import { Logger as __logger, MessageUtils as __messageUtils } from '@/utils';

interface TwitchOptions {
  channels: string[];
  identity?: {
    username: string;
    password: string;
  };
}

const defaultInternalDependencies = {
  tmiClientConstructor: Client,
  environmentVariables: EnvironmentVariables,
  logger: __logger,
  messageUtils: __messageUtils,
};

export default class TwitchService {
  private readonly _logger: typeof __logger;
  private readonly _spotifyService: ISpotifyService;
  private readonly _tmiClientConstructor: ClientConstructor;
  private readonly _environmentVariables: IEnvironmentVariables;
  private readonly _messageUtils: typeof __messageUtils;

  // Asserting that this will be defined as it's expected that connectToChat will be called immediately
  private twitchClient!: Client;

  constructor(
    dependencies: { spotifyService: ISpotifyService },
    {
      tmiClientConstructor,
      environmentVariables,
      logger,
      messageUtils,
    } = defaultInternalDependencies
  ) {
    this._spotifyService = dependencies.spotifyService;
    this._tmiClientConstructor = tmiClientConstructor;
    this._logger = logger;
    this._environmentVariables = environmentVariables;
    this._messageUtils = messageUtils;
  }

  public async connectToChat() {
    this.twitchClient = this._tmiClientConstructor(
      this.constructTwitchOptions()
    );

    this.twitchClient.on('connected', () =>
      this._logger.log(
        `Connected to ${this._environmentVariables.TWITCH_CHANNEL}'s chat`
      )
    );

    this.twitchClient.on('message', this.handleMessage);

    try {
      await this.twitchClient.connect();
    } catch (e) {
      this._logger.error(`Error connecting to Twitch - ${e}`);
      process.exit(-1);
    }
  }

  async handleMessage(
    target: string,
    userState: ChatUserstate,
    msg: string,
    self: boolean
  ) {
    if (self) {
      return;
    }

    const { COMMAND_PREFIX, SUBSCRIBERS_ONLY } = this._environmentVariables;

    if (COMMAND_PREFIX && msg.startsWith(COMMAND_PREFIX)) {
      if (SUBSCRIBERS_ONLY) {
        if (!userState.subscriber) {
          return;
        }
      }

      this._logger.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      msg = msg.substring(`${COMMAND_PREFIX} `.length);
      if (this._messageUtils.startsWithSpotifyLink(msg)) {
        await this.handleSpotifyLink(msg, target);
      } else {
        this._logger.log('Command used but no Spotify link provided');
        await this.chatFeedback(
          target,
          'Fail (no link): No Spotify link detected'
        );
      }
      this._logger.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    }
  }

  async chatFeedback(target: string, message: string) {
    if (this._environmentVariables.CHAT_FEEDBACK) {
      await this.twitchClient.say(target, message);
    }
  }

  private constructTwitchOptions(): TwitchOptions {
    const {
      TWITCH_CHANNEL,
      CHAT_FEEDBACK,
      TWITCH_TOKEN,
      BOT_USERNAME,
    } = this._environmentVariables;

    let twitchOptions: TwitchOptions = {
      channels: [TWITCH_CHANNEL],
    };

    if (CHAT_FEEDBACK) {
      if (TWITCH_TOKEN && BOT_USERNAME) {
        twitchOptions = {
          ...twitchOptions,
          identity: {
            username: BOT_USERNAME,
            password: TWITCH_TOKEN,
          },
        };
      } else {
        this._logger.error(
          'Error: Chat feedback enabled but there is no TWITCH_TOKEN or BOT_USERNAME in the config'
        );
        process.exit(-1);
      }
    }

    return twitchOptions;
  }

  private async handleSpotifyLink(message: string, target: string) {
    try {
      const trackId = this._messageUtils.getTrackIdFromLink(message);
      await this._spotifyService.addTrack(trackId, (chatMessage) => {
        this.chatFeedback(target, chatMessage);
      });
    } catch (e) {
      this._logger.error('Unable to parse track ID from message');
      await this.chatFeedback(
        target,
        'Fail (invalid message): Unable to parse track ID from message'
      );
    }
  }
}
