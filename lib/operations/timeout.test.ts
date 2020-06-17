import { assert, assertEquals, assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { ClientError, ConnectionError, MessageError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { ValidationError } from "../validation/validation-error.ts";
import { timeout, UserTimeoutError } from "./timeout.ts";

Deno.test("UserTimeoutError should not be instanceof ConnectionError", () => {
  assert(!(
    new UserTimeoutError("pajlada", "weeb123", 120, "read the rules >(") instanceof
    ConnectionError),
  );
});
Deno.test("UserTimeoutError should not be instanceof ClientError", () => {
  assert(!(
    new UserTimeoutError("pajlada", "weeb123", 120, "read the rules >(") instanceof
    ClientError),
  );
});

Deno.test("timeout should send the correct wire command if no reason is given", async () => {
  const { client, data, clientError } = await fakeConnection();
  clientError.catch(ignoreErrors);

  await switchToImmediateTimeout(
    () => timeout(client, "pajlada", "weeb123", 120).catch(ignoreErrors));

  assertEquals(data, [
    "PRIVMSG #pajlada :/timeout weeb123 120\r\n",
  ]);
});

Deno.test("timeout should send the correct wire command if a reason is given", async () => {
  const { client, clientError, end, data } = await fakeConnection();
  clientError.catch(ignoreErrors);

  await switchToImmediateTimeout(
    () => timeout(client, "pajlada", "weeb123", 120, "read the rules >(")
      .catch(ignoreErrors));

  assertEquals(data, [
    "PRIVMSG #pajlada :/timeout weeb123 120 read the rules >(\r\n",
  ]);
  await end();
});

Deno.test("timeout should validate the given channel name", async () => {
  const { client, clientError, end, data } = await fakeConnection();

  const promise = timeout(client, "PAJLADA", "weeb123", 120);
  await assertErrorChain(
    promise,
    ValidationError,
    "Channel name \"PAJLADA\" is invalid/malformed",
  );
  await end();
  await clientError;
  assertStrictEquals(data.length, 0);
});

Deno.test("timeout should validate the given username", async () => {
  const { client, clientError, end, data } = await fakeConnection();

  const promise = timeout(client, "pajlada", "WEEB123", 120);
  await assertErrorChain(
    promise,
    ValidationError,
    "Channel name \"WEEB123\" is invalid/malformed",
  );
  await end();
  await clientError;
  assertStrictEquals(data.length, 0);
});

Deno.test("timeout should not send newlines in the reason", async () => {
  const { client, clientError, end, data } = await fakeConnection();

  const promise = timeout(
    client,
    "pajlada",
    "weeb123",
    120,
    "Please\r\nread the rules!",
  );

  await assertErrorChain(
    promise,
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
  await end();
  await clientError;
  assertStrictEquals(data.length, 0);
});

Deno.test("timeout should resolve on incoming timeout_success", async () => {
  const { client, emitAndEnd, clientError } = await fakeConnection();

  const promise = timeout(
    client,
    "pajlada",
    "weeb123",
    420,
    "Please read the rules!",
  );

  await emitAndEnd(
    "@msg-id=timeout_success :tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second.",
  );

  await promise;
  await clientError;
});

Deno.test("timeout should reject on incoming no_permission", async () => {
  const { client, emitAndEnd, clientError } = await fakeConnection();

  const promise = timeout(
    client,
    "forsen",
    "weeb123",
    420,
    "Please read the rules!",
  );

  const response =
    "@msg-id=no_permission :tmi.twitch.tv NOTICE #forsen " +
    ":You don't have permission to perform that action.";
  await emitAndEnd(response);

  await assertErrorChain(
    [promise, clientError],
    UserTimeoutError,
    // TODO: times
    "Failed to timeout weeb123 for 420s in #forsen: Bad response message: " +
    response,
    MessageError,
    "Bad response message: " + response,
  );
});
