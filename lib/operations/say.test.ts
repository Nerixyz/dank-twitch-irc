import {assertStrictEquals, assert, assertEquals} from "https://deno.land/std/testing/asserts.ts";
import { ClientError, ConnectionError, MessageError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { me, removeCommands, say, SayError } from "./say.ts";

Deno.test("removeCommands should remove all twitch commands", () => {
  assertStrictEquals(removeCommands("/me hi"), "/ /me hi");
  assertStrictEquals(removeCommands(".me hi"), "/ .me hi");
  assertStrictEquals(
    removeCommands("/timeout weeb123 5"),
    "/ /timeout weeb123 5",
  );
});

Deno.test("removeCommands should not prepend a slash to other messages", () => {
  assertStrictEquals(removeCommands(""), "");
  assertStrictEquals(removeCommands("\\me hi"), "\\me hi");
  assertStrictEquals(removeCommands("hello world!"), "hello world!");
});
Deno.test("SayError should not be instanceof ConnectionError", () => {
  assert(!(
    new SayError("pajlada", "test", true) instanceof
    ConnectionError)
  );
});
Deno.test("SayError should not be instanceof ClientError", () => {
  assert(!(new SayError("pajlada", "test", true) instanceof ClientError));
});
Deno.test("say should send the correct wire command", async () => {
  const { data, client, clientError } = await fakeConnection();
  clientError.catch(ignoreErrors);

  await switchToImmediateTimeout(
    () => say(client, "pajlada", "/test test abc KKona").catch(ignoreErrors));

  assertEquals(data, [
    "PRIVMSG #pajlada :/ /test test abc KKona\r\n",
  ]);
});

Deno.test("say should resolve on USERSTATE", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = say(client, "pajlada", "/test test abc KKona");

  const userstateResponse =
    "@badge-info=;badges=;color=;display-name=justinfan12345;emote-sets=0;mod=0;" +
    "subscriber=0;user-type= :tmi.twitch.tv USERSTATE #pajlada";
  await emitAndEnd(userstateResponse);

  const response = await promise;
  assertStrictEquals(response.rawSource, userstateResponse);

  await clientError;
});

Deno.test("say should reject on msg_channel_suspended", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = say(client, "pajlada", "abc def");

  await emitAndEnd(
    "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE" +
    " #pajlada :This channel has been suspended.",
  );

  await assertErrorChain(
    promise,
    SayError,
    "Failed to say [#pajlada]: abc def: Bad response message: " +
    "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE #pajlad" +
    "a :This channel has been suspended.",
    MessageError,
    "Bad response message: @msg-id=msg_channel_suspended :tmi.twit" +
    "ch.tv NOTICE #pajlada :This channel has been suspended.",
  );

  await assertErrorChain(
    clientError,
    SayError,
    "Failed to say [#pajlada]: abc def: Bad response message: @msg" +
    "-id=msg_channel_suspended :tmi.twitch.tv NOTICE #pajlada :Th" +
    "is channel has been suspended.",
    MessageError,
    "Bad response message: @msg-id=msg_channel_suspended :tmi.twitc" +
    "h.tv NOTICE #pajlada :This channel has been suspended.",
  );
});
Deno.test("me should send the correct wire command", async () => {
  const { data, client, clientError } = await fakeConnection();
  clientError.catch(ignoreErrors)

  await switchToImmediateTimeout(() => me(client, "pajlada", "test abc KKona").catch(ignoreErrors));

  assertEquals(data, [
    "PRIVMSG #pajlada :/me test abc KKona\r\n",
  ]);
});

Deno.test("me should resolve on USERSTATE", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = me(client, "pajlada", "test test abc KKona");

  const userstateResponse =
    "@badge-info=;badges=;color=;display-name=justinfan12345;emote-sets=0;mod=0;" +
    "subscriber=0;user-type= :tmi.twitch.tv USERSTATE #pajlada";
  await emitAndEnd(userstateResponse);

  const response = await promise;
  assertStrictEquals(response.rawSource, userstateResponse);

  await clientError;
});

Deno.test("me should reject on msg_channel_suspended", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = me(client, "pajlada", "abc def");

  await emitAndEnd(
    "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE" +
    " #pajlada :This channel has been suspended.",
  );

  await assertErrorChain(
    promise,
    SayError,
    "Failed to say [#pajlada]: /me abc def: Bad response message: " +
    "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE #pajlad" +
    "a :This channel has been suspended.",
    MessageError,
    "Bad response message: @msg-id=msg_channel_suspended :tmi.twit" +
    "ch.tv NOTICE #pajlada :This channel has been suspended.",
  );

  await assertErrorChain(
    clientError,
    SayError,
    "Failed to say [#pajlada]: /me abc def: Bad response message: @msg" +
    "-id=msg_channel_suspended :tmi.twitch.tv NOTICE #pajlada :Th" +
    "is channel has been suspended.",
    MessageError,
    "Bad response message: @msg-id=msg_channel_suspended :tmi.twitc" +
    "h.tv NOTICE #pajlada :This channel has been suspended.",
  );
});
