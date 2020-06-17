import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { ClientError, ConnectionError, MessageError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { LoginError, sendLogin } from "./login.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";

Deno.test("sendLogin should only send NICK if password == null", async () => {
  const { data, client, clientError } = await fakeConnection();
  clientError.catch(ignoreErrors)

  await switchToImmediateTimeout(
    () => sendLogin(client, "justinfan12345", undefined).catch(ignoreErrors));
  assertEquals(data, ["NICK justinfan12345\r\n"]);
});

Deno.test("sendLogin should send NICK and PASS if password is specified", async () => {
  const { data, client, clientError } = await fakeConnection();
  clientError.catch(ignoreErrors)

  await switchToImmediateTimeout(
    () => sendLogin(client, "justinfan12345", "SCHMOOPIE").catch(ignoreErrors));
  assertEquals(data, ["PASS SCHMOOPIE\r\n", "NICK justinfan12345\r\n"]);
});

Deno.test("sendLogin should prepend oauth: if missing", async () => {
  const { data, client , clientError} = await fakeConnection();
  clientError.catch(ignoreErrors);

  await switchToImmediateTimeout(
    () => sendLogin(client, "pajlada", "12345").catch(ignoreErrors));
  assertEquals(data, ["PASS oauth:12345\r\n", "NICK pajlada\r\n"]);
});

Deno.test("sendLogin should resolve on 001", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = sendLogin(client, "justinfan12345", "SCHMOOPIE");

  await emitAndEnd(":tmi.twitch.tv 001 justinfan12345 :Welcome, GLHF!");

  // no error should occur
  await promise;
  await clientError;
});

Deno.test("sendLogin should reject with LoginError on NOTICE", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = sendLogin(client, "justinfan12345", "SCHMOOPIE");

  await emitAndEnd(":tmi.twitch.tv NOTICE * :Improperly formatted auth");

  await assertErrorChain(
    promise,
    LoginError,
    "Failed to login: Bad response message: :tmi.twitch" +
    ".tv NOTICE * :Improperly formatted auth",
    MessageError,
    "Bad response message: :tmi.twitch.tv NOTICE * :Improperly formatted auth",
  );

  await assertErrorChain(
    clientError,
    LoginError,
    "Failed to login: Bad response message: :tmi.twitch." +
    "tv NOTICE * :Improperly formatted auth",
    MessageError,
    "Bad response message: :tmi.twitch.tv NOTICE * :Improperly formatted auth",
  );
});

Deno.test("LoginError should be instanceof ConnectionError", () => {
  assertInstanceOf(new LoginError(), ConnectionError);
});
Deno.test("LoginError should not be instanceof ClientError", () => {
  assert(!(new LoginError() instanceof ClientError));
});
