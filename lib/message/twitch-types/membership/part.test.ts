import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseTwitchMessage } from "../../parser/twitch-message.ts";
import { PartMessage } from "./part.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("PartMessage should be able to parse a real PART message", () => {
  const msg = parseTwitchMessage(
    ":justinfan11111!justinfan11111@justinfan11111.tmi.twitch.tv PART #pajlada",
  ) as PartMessage;

  assertInstanceOf(msg, PartMessage);

  assertStrictEquals(msg.channelName, "pajlada");
  assertStrictEquals(msg.partedUsername, "justinfan11111");
});
