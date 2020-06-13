import { awaitResponse } from "../await/await-response.ts";
import { SingleConnection } from "../client/connection.ts";
import { ConnectionError } from "../client/errors.ts";
import { PongMessage } from "../message/twitch-types/connection/pong.ts";

export class PingTimeoutError extends ConnectionError {}

function randomPingIdentifier(): string {
  // scuffed but a quick replacement
  return `dank-twitch-irc:manual:${(Math.random()*10e18).toString(16)}${(Math.random()*10e18).toString(16)}`;
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
