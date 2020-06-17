import {
  assertStrictEquals,
  assertEquals,
  assert,
} from "https://deno.land/std/testing/asserts.ts";
import { TimeoutError } from "../await/timeout-error.ts";
import { ClientError, ConnectionError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { PingTimeoutError, sendPing } from "./ping.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";

Deno.test("sendPing should send the correct wire command if ping identifier is specified",
  async () => {
    const { data, client, clientError } = await fakeConnection();
    clientError.catch(ignoreErrors);

    await switchToImmediateTimeout(() => sendPing(client, "some identifier").catch(ignoreErrors));

    assertEquals(data, ["PING :some identifier\r\n"]);
  });

Deno.test("sendPing should send a random ping identifier if no ping identifier is specified",
  async () => {
    const { data, client, clientError } = await fakeConnection();
    clientError.catch(ignoreErrors);

    await switchToImmediateTimeout(() => sendPing(client).catch(ignoreErrors));

    assertStrictEquals(data.length, 1);
    assert(data[0].match(/^PING :dank-twitch-irc:manual:[0-9a-f]{32}\r\n$/));
  });

Deno.test("sendPing should resolve on matching PONG", async () => {
  const { client, emitAndEnd, clientError } = await fakeConnection();

  const promise = sendPing(client, "some identifier");

  await emitAndEnd(":tmi.twitch.tv PONG tmi.twitch.tv :some identifier");

  const pongMessage = await promise;
  assertStrictEquals(pongMessage.argument, "some identifier");

  await clientError;
});

Deno.test("sendPing should reject on timeout of 2000 milliseconds by default", async () => {
  const { client, clientError } = await fakeConnection();

  const promise = switchToImmediateTimeout(() => sendPing(client, "some identifier"));

  await assertErrorChain(
    promise,
    PingTimeoutError,
    "Server did not PONG back: Timed out after waiting for response for 2000 milliseconds",
    TimeoutError,
    "Timed out after waiting for response for 2000 milliseconds",
  );

  await assertErrorChain(
    clientError,
    PingTimeoutError,
    "Server did not PONG back: Timed out after waiting for response for 2000 milliseconds",
    TimeoutError,
    "Timed out after waiting for response for 2000 milliseconds",
  );
});

Deno.test("PingTimeoutError should be instanceof ConnectionError", () => {
  assertInstanceOf(new PingTimeoutError(), ConnectionError);
});
Deno.test("PingTimeoutError should not be instanceof ClientError", () => {
  assert(!(new PingTimeoutError() instanceof ClientError));
});
