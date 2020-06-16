import * as debugLogger from "https://deno.land/std/log/mod.ts";
import { ResponseAwaiter } from "../await/await-response.ts";
import { ClientConfiguration } from "../config/config.ts";
import { handleReconnectMessage } from "../functionalities/handle-reconnect-message.ts";
import { replyToServerPing } from "../functionalities/reply-to-ping.ts";
import { sendClientPings } from "../functionalities/send-pings.ts";
import { parseTwitchMessage } from "../message/parser/twitch-message.ts";
import { ConnectionMixin } from "../mixins/base-mixin.ts";
import { sendLogin } from "../operations/login.ts";
import { requestCapabilities } from "../operations/request-capabilities.ts";
import { anyCauseInstanceof } from "../utils/any-cause-instanceof.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { validateIRCCommand } from "../validation/irc-command.ts";
import { BaseClient } from "./base-client.ts";
import { ConnectionError, ProtocolError } from "./errors.ts";
import { makeTransport } from "./transport/make-transport.ts";
import { Transport } from "./transport/transport.ts";

let connectionIDCounter = 0;

export class SingleConnection extends BaseClient {
  public readonly connectionID = connectionIDCounter++;

  public readonly wantedChannels: Set<string> = new Set<string>();
  public readonly joinedChannels: Set<string> = new Set<string>();

  public readonly pendingResponses: ResponseAwaiter[] = [];
  public readonly transport: Transport;

  protected readonly log = debugLogger.getLogger(
    `dank-twitch-irc:connection:${this.connectionID}`
  );

  public constructor(configuration?: ClientConfiguration) {
    super(configuration);

    this.on("error", (e) => {
      if (anyCauseInstanceof(e, ConnectionError)) {
        queueMicrotask(() => {
          this.emitClosed(e);
          this.transport.close();
        });
      }
    });
    this.on("connect", this.onConnect.bind(this));

    this.transport = makeTransport(this.configuration.connection);

    replyToServerPing(this);
    handleReconnectMessage(this);
  }

  public createTransportSink(): UnderlyingSink<string> {
    return {
      close: () => {
        this.emitClosed();
      },
      abort: (reason: Error) => {
        const emittedError = new ConnectionError(
          "Error occurred in transport layer",
          reason
        );
        this.emitError(emittedError);
        this.emitClosed(emittedError);
        this.transport.close();
      },
      write: (chunk: string) => {
        this.handleLine(chunk);
      },
      start() {
      }
    };
  }

  public async connect(): Promise<void> {
    if (!this.unconnected) {
      throw new Error(
        "connect() may only be called on unconnected connections"
      );
    }

    this.emitConnecting();

    this.transport.duplex.readable.pipeTo(new WritableStream( {
      close: () => {this.emitClosed()},
      write: chunk => {
        for(const line of chunk.split('\r\n')) {
          this.handleLine(line);
        }
      }
    })).catch(e => this.emitError(e));

    await this.transport.connect();
    this.emitConnected();

    // check if the client is set up yet
    if(!this.configuration.connection.preSetup) {
      // FeelsDonkMan maybe await this?
      Promise.all([
        requestCapabilities(
          this,
          this.configuration.requestMembershipCapability
        ),
        sendLogin(
          this,
          this.configuration.username,
          this.configuration.password
        )
      ]).then(() => this.emitReady(), e => this.emitError(e));
    }

  }

  public close(): void {
    // -> close is emitted
    this.transport.close();
  }

  public destroy(error?: Error): void {
    this.transport.close();
  }

  public sendRaw(command: string): void {
    validateIRCCommand(command);
    this.log.info(">", command);
    const writer = this.transport.duplex.writable.getWriter();
    //noinspection JSIgnoredPromiseFromCall -- no :)
    writer.write(command + '\r\n');
    // immediately release to not block the lock
    writer.releaseLock();
  }

  public onConnect(): void {
    sendClientPings(this);
  }

  public use(mixin: ConnectionMixin): void {
    mixin.applyToConnection(this);
  }

  private handleLine(line: string): void {
    if (line.length <= 0) {
      // ignore empty lines (allowed in IRC)
      return;
    }

    this.log.info("<", line);

    let message;
    try {
      message = parseTwitchMessage(line);
    } catch (e) {
      this.emitError(
        new ProtocolError(
          `Error while parsing IRC message from line "${line}"`,
          e
        )
      );
      return;
    }
    this.emitMessage(message);
  }
}
