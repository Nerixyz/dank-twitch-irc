import { assertEquals, assert, AssertionError } from "https://deno.land/std/testing/asserts.ts";
import { TimeoutError } from "../await/timeout-error.ts";
import { ClientError, ConnectionError, MessageError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { parseTwitchMessage } from "../message/parser/twitch-message.ts";
import { JoinMessage } from "../message/twitch-types/membership/join.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { joinChannel, JoinError, joinNothingToDo } from "./join.ts";
import { assertInstanceOf, assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("joinNotingToDo should be false if channel is not joined or wanted", async () => {
  // typical situation where channel is not joined and is now being
  // joined.
  const { client } = await fakeConnection();

  client.wantedChannels.clear();

  client.joinedChannels.clear();

  assertFalse(joinNothingToDo(client, "pajlada"));
});

Deno.test("joinNotingToDo should be false if channel is joined but not wanted", async () => {
  // situation where we are still joined but don't want to be, e.g.
  // a part is in progress, but we can already begin re-joining
  const { client } = await fakeConnection();

  client.wantedChannels.clear();

  client.joinedChannels.clear();
  client.joinedChannels.add("pajlada");

  assertFalse(joinNothingToDo(client, "pajlada"));
});

Deno.test("joinNotingToDo should be false if channel is not joined but wanted", async () => {
  // e.g. previously failed JOIN, allow the join to be retried
  const { client } = await fakeConnection();

  client.wantedChannels.clear();
  client.wantedChannels.add("pajlada");

  client.joinedChannels.clear();

  assertFalse(joinNothingToDo(client, "pajlada"));
});

Deno.test("joinNotingToDo should be true if channel is joined and wanted", async () => {
  // channel is both joined and supposed to be joined, only in
  // this case is nothing to do.
  const { client } = await fakeConnection();

  client.wantedChannels.clear();
  client.wantedChannels.add("pajlada");

  client.joinedChannels.clear();

  assertFalse(joinNothingToDo(client, "pajlada"));
});

Deno.test("joinChannel sends the correct wire command", async () => {
  const { data, client, clientError } = await fakeConnection();
  await switchToImmediateTimeout(() => joinChannel(client, "pajlada").catch(ignoreErrors));
  assertEquals(data, ["JOIN #pajlada\r\n"]);
  await clientError.catch(ignoreErrors);
});

Deno.test("joinChannel does nothing if channel is joined and wanted", async () => {
  const { data, client } = await fakeConnection();
  client.wantedChannels.add("pajlada");
  client.joinedChannels.add("pajlada");
  await joinChannel(client, "pajlada");
  assertEquals(data, []);
});

Deno.test("joinChannel sends the command if channel is not in joinedChannels but in wantedChannels",
  async () => {
    const { data, client, end, clientError } = await fakeConnection();
    client.wantedChannels.add("pajlada");
    await switchToImmediateTimeout(() => joinChannel(client, "pajlada").catch(ignoreErrors));
    assertEquals(data, ["JOIN #pajlada\r\n"]);
    await clientError.catch(ignoreErrors)
  });

Deno.test("joinChannel resolves on incoming JOIN", async () => {
  const { emitAndEnd, client, clientError } = await fakeConnection();

  const promise = joinChannel(client, "pajlada");

  await emitAndEnd(
    ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #pajlada",
    "@emote-only=0;followers-only=5;r9k=0;rituals=0;room-id=11148817;slow=0;subs-only=0 " +
    ":tmi.twitch.tv ROOMSTATE #pajlada",
    ":justinfan12345.tmi.twitch.tv 353 justinfan12345 = #pajlada :justinfan12345",
    ":justinfan12345.tmi.twitch.tv 366 justinfan12345 #pajlada :End of /NAMES list",
  );

  assertEquals(
    await promise,
    parseTwitchMessage(
      ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #pajlada",
    ) as JoinMessage,
  );
  await clientError;
});

Deno.test("joinChannel adds channel to channel list on success", async () => {
  const { emitAndEnd, client, clientError } = await fakeConnection();

  const promise = joinChannel(client, "pajlada");

  await emitAndEnd(
    ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #pajlada",
    "@emote-only=0;followers-only=5;r9k=0;rituals=0;room-id=11148817;slow=0;subs-only=0 " +
    ":tmi.twitch.tv ROOMSTATE #pajlada",
    ":justinfan12345.tmi.twitch.tv 353 justinfan12345 = #pajlada :justinfan12345",
    ":justinfan12345.tmi.twitch.tv 366 justinfan12345 #pajlada :End of /NAMES list",
  );

  await Promise.all([promise, clientError]);

  assertEquals([...client.joinedChannels], ["pajlada"]);
});

Deno.test("joinChannel only adds to wantedChannels on msg_channel_suspended failure",
  async () => {
    // given
    const { client, emitAndEnd, clientError } = await fakeConnection();

    // when
    const promise = joinChannel(client, "test");
    await emitAndEnd(
      "@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE " +
      "#test :This channel has been suspended.",
    );

    // then
    await assertErrorChain(
      promise,
      JoinError,
      "Failed to join channel test: Bad response message: @msg-id=msg_cha" +
      "nnel_suspended :tmi.twitch.tv NOTICE #test :This channel has bee" +
      "n suspended.",
      MessageError,
      "Bad response message: @msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE " +
      "#test :This channel has been suspended.",
    );

    await assertErrorChain(
      clientError,
      JoinError,
      "Failed to join channel test: Bad response message: @msg-id=msg_cha" +
      "nnel_suspended :tmi.twitch.tv NOTICE #test :This channel has bee" +
      "n suspended.",
      MessageError,
      "Bad response message: @msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE " +
      "#test :This channel has been suspended.",
    );

    assertEquals([...client.wantedChannels], ["test"]);
    assertEquals([...client.joinedChannels], []);
  });

Deno.test("joinChannel only adds to wantedChannels on connection close (no error)",
  async () => {
    // given
    const { end, client, clientError } = await fakeConnection();

    // when
    const promise = joinChannel(client, "pajlada");
    await end();

    // then
    await assertErrorChain(
      promise,
      JoinError,
      "Failed to join channel pajlada: Connection closed with no error",
      ConnectionError,
      "Connection closed with no error",
    );

    // no error
    await clientError;
    assert(client.closed, "Client should be closed");

    assertEquals([...client.wantedChannels], ["pajlada"]);
    assertEquals([...client.joinedChannels], []);
  });

Deno.test("joinChannel only adds to wantedChannels on connection close (with error)",
  async () => {
    // given
    const { end, client, clientError, } = await fakeConnection();

    // when
    const promise = joinChannel(client, "pajlada");
    await end(new Error("peer reset connection"));

    // then
    await assertErrorChain(
      promise,
      JoinError,
      "Failed to join channel pajlada: Connection closed " +
      "due to error: Error occurred in transport layer: p" +
      "eer reset connection",
      ConnectionError,
      "Connection closed due to error: Error occurred in tran" +
      "sport layer: peer reset connection",
      ConnectionError,
      "Error occurred in transport layer: peer reset connection",
      Error,
      "peer reset connection",
    );
    console.log('post promise');

    await assertErrorChain(
      clientError,
      ConnectionError,
      "Error occurred in transport layer: peer reset connection",
      Error,
      "peer reset connection",
    );
    console.log('post client error');

    assert(client.closed, "Client should be closed");

    assertEquals([...client.wantedChannels], ["pajlada"]);
    assertEquals([...client.joinedChannels], []);
  });

Deno.test("joinChannel should fail on timeout of 2000 ms", async () => {
  const { client, clientError } = await fakeConnection();

  const override = setTimeout;
  let local: Function | undefined = undefined;
  globalThis.setTimeout = (fn: Function) => {
    local = fn;
    return 0;
  };
  const promise = joinChannel(client, "test");

  if(!local)
    throw new AssertionError('local is undefined');

  //@ts-ignore
  local();

  globalThis.setTimeout = override;

  await assertErrorChain(
    promise,
    JoinError,
    "Failed to join channel test: Timed out after waiting for res" +
    "ponse for 2000 milliseconds",
    TimeoutError,
    "Timed out after waiting for response for 2000 milliseconds",
  );

  await assertErrorChain(
    clientError,
    JoinError,
    "Failed to join channel test: Timed out after waiting for res" +
    "ponse for 2000 milliseconds",
    TimeoutError,
    "Timed out after waiting for response for 2000 milliseconds",
  );
});

Deno.test("JoinError should not be instanceof ConnectionError", () => {
  assert(!(new JoinError("test") instanceof ConnectionError));
});
Deno.test("JoinError should not be instanceof ClientError", () => {
  assert(!(new JoinError("test") instanceof ClientError));
});
