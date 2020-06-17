import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { TwitchBadge } from "../badge.ts";
import { TwitchBadgesList } from "../badges.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { parseActionAndMessage, PrivmsgMessage } from "./privmsg.ts";
import { assertInstanceOf, assertFalse } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("parseActionAndMessage should return non-actions unmodified", () => {
  assertEquals(parseActionAndMessage("HeyGuys"), {
    isAction: false,
    message: "HeyGuys",
  });

  assertEquals(parseActionAndMessage("\u0001ACTION HeyGuys"), {
    isAction: false,
    message: "\u0001ACTION HeyGuys",
  });

  assertEquals(parseActionAndMessage("HeyGuys\u0001"), {
    isAction: false,
    message: "HeyGuys\u0001",
  });

  // missing space
  assertEquals(
    parseActionAndMessage("\u0001ACTIONHeyGuys\u0001"),
    {
      isAction: false,
      message: "\u0001ACTIONHeyGuys\u0001",
    },
  );
});

Deno.test("parseActionAndMessage should remove action prefix and suffix on valid actions",
  () => {
    assertEquals(
      parseActionAndMessage("\u0001ACTION HeyGuys\u0001"),
      {
        isAction: true,
        message: "HeyGuys",
      },
    );

    // nested
    assertEquals(
      parseActionAndMessage("\u0001ACTION \u0001ACTION HeyGuys\u0001\u0001"),
      {
        isAction: true,
        message: "\u0001ACTION HeyGuys\u0001",
      },
    );
  });

Deno.test("PrivmsgMessage should be able to parse a real PRIVMSG message", () => {
  const msgText =
    "@badge-info=subscriber/5;badges=broadcaster/1,subscriber/0;" +
    "color=#19E6E6;display-name=randers;emotes=;flags=;id=7eb848c9-1060-4e5e-9f4c-612877982e79;" +
    "mod=0;room-id=40286300;subscriber=1;tmi-sent-ts=1563096499780;turbo=0;" +
    "user-id=40286300;user-type= :randers!randers@randers.tmi.twitch.tv PRIVMSG #randers :test";

  const msg: PrivmsgMessage = parseTwitchMessage(msgText) as PrivmsgMessage;

  assertInstanceOf(msg, PrivmsgMessage);

  assertStrictEquals(msg.channelName, "randers");

  assertStrictEquals(msg.messageText, "test");
  assertFalse(msg.isAction);

  assertStrictEquals(msg.senderUsername, "randers");

  assertStrictEquals(msg.senderUserID, "40286300");

  assertEquals(
    msg.badgeInfo,
    new TwitchBadgesList(new TwitchBadge("subscriber", "5")),
  );
  assertStrictEquals(msg.badgeInfoRaw, "subscriber/5");

  assertEquals(
    msg.badges,
    new TwitchBadgesList(
      new TwitchBadge("broadcaster", "1"),
      new TwitchBadge("subscriber", "0"),
    ),
  );
  assertStrictEquals(msg.badgesRaw, "broadcaster/1,subscriber/0");

  assertStrictEquals(msg.bits, undefined);
  assertStrictEquals(msg.bitsRaw, undefined);

  assertEquals(msg.color, { r: 0x19, g: 0xe6, b: 0xe6 });
  assertStrictEquals(msg.colorRaw, "#19E6E6");

  assertStrictEquals(msg.displayName, "randers");

  assertEquals(msg.emotes, []);
  assertStrictEquals(msg.emotesRaw, "");

  assertStrictEquals(msg.messageID, "7eb848c9-1060-4e5e-9f4c-612877982e79");

  assertFalse(msg.isMod);
  assertStrictEquals(msg.isModRaw, "0");

  assertStrictEquals(msg.channelID, "40286300");

  assertStrictEquals(msg.serverTimestamp.getTime(), 1563096499780);
  assertStrictEquals(msg.serverTimestampRaw, "1563096499780");

  assertEquals(msg.extractUserState(), {
    badgeInfo: new TwitchBadgesList(new TwitchBadge("subscriber", "5")),
    badgeInfoRaw: "subscriber/5",
    badges: new TwitchBadgesList(
      new TwitchBadge("broadcaster", "1"),
      new TwitchBadge("subscriber", "0"),
    ),
    badgesRaw: "broadcaster/1,subscriber/0",
    color: { r: 0x19, g: 0xe6, b: 0xe6 },
    colorRaw: "#19E6E6",
    displayName: "randers",
    isMod: false,
    isModRaw: "0",
  });

  assertFalse(msg.isCheer());
});
