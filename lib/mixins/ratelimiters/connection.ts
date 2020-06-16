import { ChatClient } from "../../client/client.ts";
import { SingleConnection } from "../../client/connection.ts";
import { applyReplacements } from "../../utils/apply-function-replacements.ts";
import Semaphore from "../../utils/semaphore.ts";
import { ClientMixin, ConnectionMixin } from "../base-mixin.ts";

export interface ConnectionRateLimits {
  parallelConnections: number;
  releaseTime: number;
}

export class ConnectionRateLimiter implements ClientMixin, ConnectionMixin {
  private readonly client: ChatClient;
  private readonly semaphore: Semaphore;

  public constructor(client: ChatClient) {
    this.client = client;

    this.semaphore = new Semaphore(
      this.client.configuration.connectionRateLimits.parallelConnections
    );
  }

  public async acquire(): Promise<void> {
    await this.semaphore.acquire();
  }

  public releaseOnConnect(conn: SingleConnection): void {
    const unsubscribers: (() => void)[] = [];

    const unsubscribe = (): void => {
      unsubscribers.forEach((e) => e());
    };

    const done = (): void => {
      unsubscribe();
      setTimeout(
        () => this.semaphore.release(),
        this.client.configuration.connectionRateLimits.releaseTime
      );
    };

    conn.on("connect", done);
    conn.on("close", done);

    unsubscribers.push(() => conn.removeListener("connect", done));
    unsubscribers.push(() => conn.removeListener("close", done));
  }

  public applyToClient(client: ChatClient): void {
    client.connectionMixins.push(this);
  }

  public applyToConnection(connection: SingleConnection): void {
    // override transport.connect
    applyReplacements(this, connection.transport, {
      connect(originalFn): Promise<void> {
        return this.acquire().then(async () => {
          await originalFn();
          this.releaseOnConnect(connection);
        });
      },
    });
  }
}
