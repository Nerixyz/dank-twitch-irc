import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseTwitchMessage } from "../../parser/twitch-message.ts";
import { PongMessage } from "./pong.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("PongMessage should be able to parse a real PONG message with no argument", () => {
  const msg = parseTwitchMessage(":tmi.twitch.tv PONG") as PongMessage;

  assertInstanceOf(msg, PongMessage);

  assertStrictEquals(msg.argument, undefined);
});
Deno.test("PongMessage should be able to parse a real PONG message with argument", () => {
  const msg = parseTwitchMessage(
    ":tmi.twitch.tv PONG tmi.twitch.tv :argument test",
  ) as PongMessage;

  assertInstanceOf(msg, PongMessage);

  assertStrictEquals(msg.argument, "argument test");
});
