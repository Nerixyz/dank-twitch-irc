import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { TwitchBadgesList } from "../badges.ts";
import { TwitchEmote } from "../emote.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { WhisperMessage } from "./whisper.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("WhisperMessage should be able to parse a real WHISPER message correctly", () => {
  const msg = parseTwitchMessage(
    "@badges=;color=#2E8B57;display-name=pajbot;emotes=25:7-11;message-id=" +
    "2034;thread-id=40286300_82008718;turbo=0;user-id=82008718;user-type= " +
    ":pajbot!pajbot@pajbot.tmi.twitch.tv WHISPER randers :Riftey Kappa",
  ) as WhisperMessage;

  assertInstanceOf(msg, WhisperMessage);

  assertStrictEquals(msg.messageText, "Riftey Kappa");

  assertStrictEquals(msg.senderUsername, "pajbot");
  assertStrictEquals(msg.senderUserID, "82008718");

  assertStrictEquals(msg.recipientUsername, "randers");

  assertEquals(msg.badges, new TwitchBadgesList());
  assertStrictEquals(msg.badgesRaw, "");

  assertEquals(msg.color, {
    r: 0x2e,
    g: 0x8b,
    b: 0x57,
  });
  assertStrictEquals(msg.colorRaw, "#2E8B57");

  assertEquals(msg.emotes, [
    new TwitchEmote("25", 7, 12, "Kappa"),
  ]);
  assertStrictEquals(msg.emotesRaw, "25:7-11");

  assertStrictEquals(msg.messageID, "2034");
  assertStrictEquals(msg.threadID, "40286300_82008718");
});
