import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseTwitchMessage } from "../../parser/twitch-message.ts";
import { PingMessage } from "./ping.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("PingMessage should be able to parse a real PING message with no argument", () => {
  const msg = parseTwitchMessage(":tmi.twitch.tv PING") as PingMessage;

  assertInstanceOf(msg, PingMessage);

  assertStrictEquals(msg.argument, undefined);
});
Deno.test("PingMessage should be able to parse a real PING message with argument", () => {
  const msg = parseTwitchMessage(
    ":tmi.twitch.tv PING tmi.twitch.tv :argument test",
  ) as PingMessage;

  assertInstanceOf(msg, PingMessage);

  assertStrictEquals(msg.argument, "argument test");
});
