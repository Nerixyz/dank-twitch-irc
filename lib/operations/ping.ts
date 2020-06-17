import { awaitResponse } from "../await/await-response.ts";
import { SingleConnection } from "../client/connection.ts";
import { ConnectionError } from "../client/errors.ts";
import { PongMessage } from "../message/twitch-types/connection/pong.ts";

export class PingTimeoutError extends ConnectionError {}

function randomPingIdentifier(): string {
  // scuffed but a quick replacement
  return `dank-twitch-irc:manual:${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x => (x & 0xf).toString(16)).join('')}`;
}

export async function sendPing(
  conn: SingleConnection,
  pingIdentifier: string = randomPingIdentifier(),
  timeout = 2000
): Promise<PongMessage> {
  conn.sendRaw(`PING :${pingIdentifier}`);

  return (await awaitResponse(conn, {
    success: (msg) =>
      msg instanceof PongMessage && msg.argument === pingIdentifier,
    timeout,
    errorType: (message, cause) => new PingTimeoutError(message, cause),
    errorMessage: "Server did not PONG back",
  })) as PongMessage;
}
