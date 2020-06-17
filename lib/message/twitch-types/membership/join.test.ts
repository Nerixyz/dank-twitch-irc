import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseTwitchMessage } from "../../parser/twitch-message.ts";
import { JoinMessage } from "./join.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("JoinMessage should be able to parse a real JOIN message", () => {
  const msg = parseTwitchMessage(
    ":justinfan11111!justinfan11111@justinfan11111.tmi.twitch.tv JOIN #pajlada",
  ) as JoinMessage;

  assertInstanceOf(msg, JoinMessage);

  assertStrictEquals(msg.channelName, "pajlada");
  assertStrictEquals(msg.joinedUsername, "justinfan11111");
});