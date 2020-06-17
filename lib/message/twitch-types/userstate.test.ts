import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { TwitchBadgesList } from "../badges.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { UserstateMessage } from "./userstate.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("UserstateMessage should be able to parse a real userstate message", () => {
  const msg = parseTwitchMessage(
    "@badge-info=;badges=;color=#FF0000;" +
    "display-name=zwb3_pyramids;emote-sets=0;mod=0;subscriber=0;user-type=" +
    " :tmi.twitch.tv USERSTATE #randers",
  ) as UserstateMessage;

  assertInstanceOf(msg, UserstateMessage);

  assertStrictEquals(msg.channelName, "randers");

  assertEquals(msg.badgeInfo, new TwitchBadgesList());
  assertStrictEquals(msg.badgeInfoRaw, "");

  assertEquals(msg.badges, new TwitchBadgesList());
  assertStrictEquals(msg.badgesRaw, "");

  assertEquals(msg.color, {
    r: 0xff,
    g: 0x00,
    b: 0x00,
  });
  assertStrictEquals(msg.colorRaw, "#FF0000");

  assertStrictEquals(msg.displayName, "zwb3_pyramids");

  assertEquals(msg.emoteSets, ["0"]);
  assertStrictEquals(msg.emoteSetsRaw, "0");

  assertStrictEquals(msg.isMod, false);
  assertStrictEquals(msg.isModRaw, "0");
});

Deno.test("UserstateMessage should extract the correct values with extractUserState()", () => {
  const msg = parseTwitchMessage(
    "@badge-info=;badges=;color=#FF0000;" +
    "display-name=zwb3_pyramids;emote-sets=0;mod=0;subscriber=0;user-type=" +
    " :tmi.twitch.tv USERSTATE #randers",
  ) as UserstateMessage;

  assertEquals(msg.extractUserState(), {
    badgeInfo: new TwitchBadgesList(),
    badgeInfoRaw: "",
    badges: new TwitchBadgesList(),
    badgesRaw: "",
    color: { r: 0xff, g: 0x00, b: 0x00 },
    colorRaw: "#FF0000",
    displayName: "zwb3_pyramids",
    emoteSets: ["0"],
    emoteSetsRaw: "0",
    isMod: false,
    isModRaw: "0",
  });
});
