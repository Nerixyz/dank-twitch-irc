import { SingleConnection } from "../client/connection.ts";
import { ConnectionError } from "../client/errors.ts";

export class ReconnectError extends ConnectionError {
  public constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export function handleReconnectMessage(conn: SingleConnection): void {
  conn.on("RECONNECT", (msg) => {
    queueMicrotask(() => {
      conn.emitError(
        new ReconnectError(
          "RECONNECT command received by server: " + msg.rawSource
        )
      );
    });
  });
}
