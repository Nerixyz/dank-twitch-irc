import { ConnectionError, MessageError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection } from "../helpers.test.ts";
import { parseTwitchMessage } from "../message/parser/twitch-message.ts";
import { BaseError } from "../utils/base-error.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { awaitResponse, ResponseAwaiter } from "./await-response.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("ResponseAwaiter should add itself to list of waiters", async () => {
  const { client, end, clientError } = await fakeConnection();
  const garbage: Promise<any>[] = [clientError.catch(ignoreErrors)];

  const awaiter1 = new ResponseAwaiter(client, {
    errorType: (message, cause) => new BaseError(message, cause),
    errorMessage: "test awaiter 1 failure",
  });

  const awaiter2 = new ResponseAwaiter(client, {
    errorType: (message, cause) => new BaseError(message, cause),
    errorMessage: "test awaiter 2 failure",
  });

  garbage.push(awaiter1.promise.catch(ignoreErrors), awaiter2.promise.catch(ignoreErrors), end());

  // uses "deep" equality
  assertEquals(client.pendingResponses, [awaiter1, awaiter2]);

  // cleanup
  await Promise.all(garbage).catch(ignoreErrors);
});

Deno.test("ResponseAwaiter should resolve on matching incoming message", async () => {
  const { client, end } = await fakeConnection();

  const wantedMsg = parseTwitchMessage("PONG :tmi.twitch.tv");

  const promise = awaitResponse(client, {
    success: (msg) => msg === wantedMsg,
    errorType: (message, cause) => new BaseError(message, cause),
    errorMessage: "test awaiter failure",
  });

  client.emitMessage(wantedMsg);

  await end();

  assertEquals(await promise, wantedMsg);
  assertEquals(client.pendingResponses, []);
});

Deno.test("ResponseAwaiter should reject on matching incoming message", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const wantedMsg = "PONG :tmi.twitch.tv";

  const promise = awaitResponse(client, {
    failure: (msg) => msg.rawSource === wantedMsg,
    errorType: (message, cause) => new BaseError(message, cause),
    errorMessage: "test awaiter failure",
  });

  await emitAndEnd(wantedMsg);

  await assertErrorChain(
    promise,
    BaseError,
    "test awaiter failure: Bad response message: PONG :tmi.twitch.tv",
    MessageError,
    "Bad response message: PONG :tmi.twitch.tv"
  );
  assertEquals(client.pendingResponses, []);

  await assertErrorChain(
    clientError,
    BaseError,
    "test awaiter failure: Bad response message: PONG :tmi.twitch.tv",
    MessageError,
    "Bad response message: PONG :tmi.twitch.tv"
  );
});

Deno.test("ResponseAwaiter should reject on connection close (no error)", async () => {
  const { client, end, clientError } = await fakeConnection();

  const promise = awaitResponse(client, {
    errorType: (message, cause) => new BaseError(message, cause),
    errorMessage: "test awaiter failure",
  });
  const clientErrorAfterClose = new Promise((resolve, reject) => {
    client.once("error", e => reject(e));
  });
  await end();
  await assertErrorChain(
    [promise, clientErrorAfterClose],
    BaseError,
    "test awaiter failure: Connection closed with no error",
    ConnectionError,
    "Connection closed with no error"
  );

  // the client is closed so the error occurring after close is not
  // emitted -> clientError is resolved because on("close") happens
  // before our ResponseAwaiter emits the error
  await clientError;
});

Deno.test("ResponseAwaiter should reject on connection close (with error)", async () => {
  const { client, end, clientError } = await fakeConnection();

  const promise = awaitResponse(client, {
    errorType: (message, cause) => new BaseError(message, cause),
    errorMessage: "test awaiter failure",
  });

  // TODO create a utility to await error no #N on arbitrary EventEmitter
  const clientErrorAfterClose = new Promise((resolve, reject) => {
    let counter = 0;
    const target = 1;
    client.on("error", (e) => {
      if (counter++ === target) {
        reject(e);
      }
    });
  });
  await end(new Error("peer reset connection"));

  await assertErrorChain(
    promise,
    BaseError,
    "test awaiter failure: Connection closed due to error: Error occurred in transport layer: peer reset connection",
    ConnectionError,
    "Connection closed due to error: Error occurred in transport layer: peer reset connection",
    ConnectionError,
    "Error occurred in transport layer: peer reset connection",
    Error,
    "peer reset connection"
  );

  await assertErrorChain(
    clientError,
    ConnectionError,
    "Error occurred in transport layer: peer reset connection",
    Error,
    "peer reset connection"
  );

  await assertErrorChain(
    clientErrorAfterClose,
    BaseError,
    "test awaiter failure: Connection closed due to error: Error occurred in transport layer: peer reset connection",
    ConnectionError,
    "Connection closed due to error: Error occurred in transport layer: peer reset connection",
    ConnectionError,
    "Error occurred in transport layer: peer reset connection",
    Error,
    "peer reset connection"
  );
});
