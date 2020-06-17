import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { ClientError, ConnectionError, MessageError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { parseTwitchMessage } from "../message/parser/twitch-message.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import {
  acknowledgesCapabilities,
  CapabilitiesError,
  deniedAnyCapability,
  requestCapabilities,
} from "./request-capabilities.ts";
import { assertInstanceOf, assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";


Deno.test(
  "acknowledgesCapabilities should only return true if given capabilities are a subset of requested capabilities",
  () => {
    assertTrue(
      acknowledgesCapabilities(["a", "b", "c"])(
        parseTwitchMessage("CAP * ACK :a b c d"),
      ),
    );

    assertTrue(
      acknowledgesCapabilities(["a", "b", "c"])(
        parseTwitchMessage("CAP * ACK :c b a"),
      ),
    );

    assertFalse(
      acknowledgesCapabilities(["a", "b", "c"])(
        parseTwitchMessage("CAP * ACK :a b"),
      ),
    );
  });

Deno.test("acknowledgesCapabilities should only consider the ACK subcommand", () => {
  assertFalse(
    acknowledgesCapabilities(["a", "b", "c"])(
      parseTwitchMessage("CAP * DEF :a b c"),
    ),
  );
});
Deno.test("deniedAnyCapability should return true if any given capability is rejected", () => {
  assertTrue(
    deniedAnyCapability(["a", "b", "c"])(
      parseTwitchMessage("CAP * NAK :a b c"),
    ),
  );

  assertTrue(
    deniedAnyCapability(["a", "b", "c"])(parseTwitchMessage("CAP * NAK :a")),
  );

  assertTrue(
    deniedAnyCapability(["a", "b", "c"])(parseTwitchMessage("CAP * NAK :c")),
  );

  assertFalse(
    deniedAnyCapability(["a", "b", "c"])(parseTwitchMessage("CAP * NAK :d")),
  );
});

Deno.test("deniedAnyCapability should only consider the NAK subcommand", () => {
  assertFalse(
    acknowledgesCapabilities(["a", "b", "c"])(
      parseTwitchMessage("CAP * DEF :a"),
    ),
  );
});

Deno.test("requestCapabilities should send the correct wire command", async () => {

  const { client, data, clientError } = await fakeConnection();
  clientError.catch(ignoreErrors);

  await switchToImmediateTimeout(async () => {
    return Promise.all([
      requestCapabilities(client, false).catch(ignoreErrors),
      requestCapabilities(client, true).catch(ignoreErrors),
    ]);
  });

  assertEquals(data, [
    "CAP REQ :twitch.tv/commands twitch.tv/tags\r\n",
    "CAP REQ :twitch.tv/commands twitch.tv/tags twitch.tv/membership\r\n",
  ]);
});

Deno.test("requestCapabilities should resolve on CAP message acknowledging all capabilities",
  async () => {
    const { client, clientError, emitAndEnd } = await fakeConnection();

    const promise = requestCapabilities(client, false);

    emitAndEnd(":tmi.twitch.tv CAP * ACK :twitch.tv/commands twitch.tv/tags");

    await promise;
    await clientError;
  });

Deno.test(
  "requestCapabilities should reject on CAP message rejecting one or more of the requested capabilities",
  async () => {
    const { client, clientError, emitAndEnd } = await fakeConnection();

    const promise = requestCapabilities(client, false);

    emitAndEnd(
      ":tmi.twitch.tv CAP * ACK :twitch.tv/commands",
      ":tmi.twitch.tv CAP * NAK :twitch.tv/tags",
    );

    await assertErrorChain(
      promise,
      CapabilitiesError,
      "Failed to request server capabilities twitch.tv/commands, " +
      "twitch.tv/tags: Bad response message: :tmi.twitch.tv CAP " +
      "* NAK :twitch.tv/tags",
      MessageError,
      "Bad response message: :tmi.twitch.tv CAP * NAK :twitch.tv/tags",
    );

    await assertErrorChain(
      clientError,
      CapabilitiesError,
      "Failed to request server capabilities twitch.tv/commands, " +
      "twitch.tv/tags: Bad response message: :tmi.twitch.tv CAP * " +
      "NAK :twitch.tv/tags",
      MessageError,
      "Bad response message: :tmi.twitch.tv CAP * NAK :twitch.tv/tags",
    );
  });

Deno.test("CapabilitiesError should be instanceof ConnectionError", () => {
  assertInstanceOf(new CapabilitiesError(), ConnectionError);
});
Deno.test("CapabilitiesError should not be instanceof ClientError", () => {
  assert(!(new CapabilitiesError() instanceof ClientError));
});
