import * as debugLogger from "https://deno.land/std/log/mod.ts";
import { ClientConfiguration } from "../config/config.ts";
import { Color } from "../message/color.ts";
import { ClientMixin, ConnectionMixin } from "../mixins/base-mixin.ts";
import { IgnoreUnhandledPromiseRejectionsMixin } from "../mixins/ignore-promise-rejections.ts";
import { ConnectionRateLimiter } from "../mixins/ratelimiters/connection.ts";
import { PrivmsgMessageRateLimiter } from "../mixins/ratelimiters/privmsg.ts";
import { RoomStateTracker } from "../mixins/roomstate-tracker.ts";
import { UserStateTracker } from "../mixins/userstate-tracker.ts";
import { joinChannel, joinNothingToDo } from "../operations/join.ts";
import { joinAll } from "../operations/join-all.ts";
import { partChannel, partNothingToDo } from "../operations/part.ts";
import { sendPing } from "../operations/ping.ts";
import { sendPrivmsg } from "../operations/privmsg.ts";
import { me, say } from "../operations/say.ts";
import { setColor } from "../operations/set-color.ts";
import { timeout } from "../operations/timeout.ts";
import { whisper } from "../operations/whisper.ts";
import { anyCauseInstanceof } from "../utils/any-cause-instanceof.ts";
import { findAndPushToEnd } from "../utils/find-and-push-to-end.ts";
import { removeInPlace } from "../utils/remove-in-place.ts";
import { unionSets } from "../utils/union-sets.ts";
import { validateChannelName } from "../validation/channel.ts";
import { BaseClient } from "./base-client.ts";
import { SingleConnection } from "./connection.ts";
import { ClientError } from "./errors.ts";

const log = debugLogger.getLogger("dank-twitch-irc:client");

export type ConnectionPredicate = (conn: SingleConnection) => boolean;
const alwaysTrue = (): true => true as const;

export class ChatClient extends BaseClient {
  public get wantedChannels(): Set<string> {
    return unionSets(this.connections.map((c) => c.wantedChannels));
  }

  public get joinedChannels(): Set<string> {
    return unionSets(this.connections.map((c) => c.joinedChannels));
  }

  public roomStateTracker?: RoomStateTracker;
  public userStateTracker?: UserStateTracker;
  public readonly connectionMixins: ConnectionMixin[] = [];

  public readonly connections: SingleConnection[] = [];
  private activeWhisperConn: SingleConnection | undefined;

  public constructor(configuration?: ClientConfiguration) {
    super(configuration);

    if (this.configuration.installDefaultMixins) {
      this.use(new UserStateTracker(this));
      this.use(new RoomStateTracker());
      this.use(new ConnectionRateLimiter(this));
      this.use(new PrivmsgMessageRateLimiter(this));
    }

    if (this.configuration.ignoreUnhandledPromiseRejections) {
      this.use(new IgnoreUnhandledPromiseRejectionsMixin());
    }

    this.on("error", (error) => {
      if (anyCauseInstanceof(error, ClientError)) {
        queueMicrotask(() => {
          this.emitClosed(error);
          this.connections.forEach((conn) => conn.destroy(error));
        });
      }
    });

    this.on("close", () => {
      this.connections.forEach((conn) => conn.close());
    });
  }

  public connect(): void {
    this.requireConnection();
  }

  public close(): void {
    // -> connections are close()d via "close" event listener
    this.emitClosed();
  }

  public destroy(error?: Error): void {
    // we emit onError before onClose just like the standard node.js core modules do
    if (error != null) {
      this.emitError(error);
      this.emitClosed(error);
    } else {
      this.emitClosed();
    }
  }

  /**
   * Sends a raw IRC command to the server, e.g. <code>JOIN #forsen</code>.
   *
   * Throws an exception if the passed command contains one or more newline characters.
   *
   * @param command Raw IRC command.
   */
  public sendRaw(command: string): void {
    this.requireConnection().sendRaw(command);
  }

  public async join(channelName: string): Promise<void> {
    validateChannelName(channelName);

    if (this.connections.some((c) => joinNothingToDo(c, channelName))) {
      // are we joined already?
      return;
    }

    const conn = this.requireConnection(
      maxJoinedChannels(this.configuration.maxChannelCountPerConnection)
    );
    await joinChannel(conn, channelName);
  }

  public async part(channelName: string): Promise<void> {
    validateChannelName(channelName);

    if (this.connections.every((c) => partNothingToDo(c, channelName))) {
      // are we parted already?
      return;
    }

    const conn = this.requireConnection(
      (c) => !partNothingToDo(c, channelName)
    );
    await partChannel(conn, channelName);
  }

  public async joinAll(
    channelNames: string[]
  ): Promise<Record<string, Error | undefined>> {
    channelNames.forEach(validateChannelName);

    const needToJoin: string[] = channelNames.filter(
      (channelName) =>
        !this.connections.some((c) => joinNothingToDo(c, channelName))
    );

    const promises: Promise<Record<string, Error | undefined>>[] = [];

    let idx = 0;
    while (idx < needToJoin.length) {
      const conn = this.requireConnection(
        maxJoinedChannels(this.configuration.maxChannelCountPerConnection)
      );

      const canJoin =
        this.configuration.maxChannelCountPerConnection -
        conn.wantedChannels.size;

      const channelsSlice = needToJoin.slice(idx, (idx += canJoin));

      promises.push(joinAll(conn, channelsSlice));
    }

    const errorChunks = await Promise.all(promises);
    return Object.assign({}, ...errorChunks);
  }

  public async privmsg(channelName: string, message: string): Promise<void> {
    validateChannelName(channelName);
    return sendPrivmsg(this.requireConnection(), channelName, message);
  }

  public async say(channelName: string, message: string): Promise<void> {
    validateChannelName(channelName);
    await say(
      this.requireConnection(mustNotBeJoined(channelName)),
      channelName,
      message
    );
  }

  public async me(channelName: string, message: string): Promise<void> {
    validateChannelName(channelName);
    await me(
      this.requireConnection(mustNotBeJoined(channelName)),
      channelName,
      message
    );
  }

  public async timeout(
    channelName: string,
    username: string,
    length: number,
    reason?: string
  ): Promise<void> {
    await timeout(
      this.requireConnection(),
      channelName,
      username,
      length,
      reason
    );
  }

  public async whisper(username: string, message: string): Promise<void> {
    validateChannelName(username);
    await whisper(this.requireConnection(), username, message);
  }

  public async setColor(color: Color): Promise<void> {
    await setColor(this.requireConnection(), color);
  }

  public async ping(): Promise<void> {
    await sendPing(this.requireConnection());
  }

  public newConnection(): SingleConnection {
    const conn = new SingleConnection(this.configuration);

    log.debug(`Creating new connection (ID ${conn.connectionID})`);

    for (const mixin of this.connectionMixins) {
      conn.use(mixin);
    }

    conn.on("connecting", () => this.emitConnecting());
    conn.on("connect", () => this.emitConnected());
    conn.on("ready", () => this.emitReady());
    conn.on("error", (error) => this.emitError(error));
    conn.on("close", (hadError) => {
      if (hadError) {
        log.warning(`Connection ${conn.connectionID} was closed due to error`);
      } else {
        log.debug(`Connection ${conn.connectionID} closed normally`);
      }

      removeInPlace(this.connections, conn);

      if (this.activeWhisperConn === conn) {
        this.activeWhisperConn = undefined;
      }

      if (!this.closed) {
        this.reconnectFailedConnection(conn);
      }
    });

    // forward events to this client
    conn.on("message", (message) => {
      // only forward whispers from the currently active whisper connection
      if (message.ircCommand === "WHISPER") {
        if (this.activeWhisperConn == null) {
          this.activeWhisperConn = conn;
        }

        if (this.activeWhisperConn !== conn) {
          // message is ignored.
          return;
        }
      }

      this.emitMessage(message);
    });

    conn.connect();

    this.connections.push(conn);
    return conn;
  }

  public use(mixin: ClientMixin): void {
    mixin.applyToClient(this);
  }

  private reconnectFailedConnection(conn: SingleConnection): void {
    // rejoin channels, creates connections on demand
    const channels = Array.from(conn.wantedChannels);

    if (channels.length > 0) {
      //noinspection JSIgnoredPromiseFromCall
      this.joinAll(channels);
    } else if (this.connections.length <= 0) {
      // this ensures that clients with zero joined channels stay connected (so they can receive whispers)
      this.requireConnection();
    }

    this.emit("reconnect", conn);
  }

  /**
   * Finds a connection from the list of connections that satisfies the given predicate,
   * or if none was found, returns makes a new connection. This means that the given predicate must be specified
   * in a way that a new connection always satisfies it.
   *
   * @param predicate The predicate the connection must fulfill.
   */
  private requireConnection(
    predicate: ConnectionPredicate = alwaysTrue
  ): SingleConnection {
    return (
      findAndPushToEnd(this.connections, predicate) || this.newConnection()
    );
  }
}

function maxJoinedChannels(maxChannelCount: number): ConnectionPredicate {
  return (conn) => conn.wantedChannels.size < maxChannelCount;
}

function mustNotBeJoined(channelName: string): ConnectionPredicate {
  return (conn) =>
    !conn.wantedChannels.has(channelName) &&
    !conn.joinedChannels.has(channelName);
}
