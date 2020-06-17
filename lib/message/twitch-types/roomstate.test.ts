import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { hasAllStateTags, RoomstateMessage } from "./roomstate.ts";
import { assertInstanceOf, assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";

Deno.test("hasAllStateTags should return true if all properties are present", () => {
  assertTrue(
    hasAllStateTags({
      emoteOnly: true,
      emoteOnlyRaw: "1",

      followersOnlyDuration: -1,
      followersOnlyDurationRaw: "-1",

      r9k: false,
      r9kRaw: "0",

      slowModeDuration: 0,
      slowModeDurationRaw: "0",

      subscribersOnly: false,
      subscribersOnlyRaw: "0",
    }),
  );
});

Deno.test("hasAllStateTags should return false if one property is absent", () => {
  assertFalse(
    hasAllStateTags({
      followersOnlyDuration: -1,
      followersOnlyDurationRaw: "-1",

      r9k: false,
      r9kRaw: "0",

      slowModeDuration: 0,
      slowModeDurationRaw: "0",

      subscribersOnly: false,
      subscribersOnlyRaw: "0",
    }),
  );
  assertFalse(
    hasAllStateTags({
      emoteOnly: true,
      emoteOnlyRaw: "1",

      r9k: false,
      r9kRaw: "0",

      slowModeDuration: 0,
      slowModeDurationRaw: "0",

      subscribersOnly: false,
      subscribersOnlyRaw: "0",
    }),
  );
  assertFalse(
    hasAllStateTags({
      emoteOnly: true,
      emoteOnlyRaw: "1",

      followersOnlyDuration: -1,
      followersOnlyDurationRaw: "-1",

      slowModeDuration: 0,
      slowModeDurationRaw: "0",

      subscribersOnly: false,
      subscribersOnlyRaw: "0",
    }),
  );
  assertFalse(
    hasAllStateTags({
      emoteOnly: true,
      emoteOnlyRaw: "1",

      followersOnlyDuration: -1,
      followersOnlyDurationRaw: "-1",

      r9k: false,
      r9kRaw: "0",

      subscribersOnly: false,
      subscribersOnlyRaw: "0",
    }),
  );
  assertFalse(
    hasAllStateTags({
      emoteOnly: true,
      emoteOnlyRaw: "1",

      followersOnlyDuration: -1,
      followersOnlyDurationRaw: "-1",

      r9k: false,
      r9kRaw: "0",

      slowModeDuration: 0,
      slowModeDurationRaw: "0",
    }),
  );
});

Deno.test("hasAllStateTags should return false if only one property is present", () => {
  assertFalse(
    hasAllStateTags({
      emoteOnly: true,
      emoteOnlyRaw: "1",
    }),
  );
  assertFalse(
    hasAllStateTags({
      followersOnlyDuration: -1,
      followersOnlyDurationRaw: "-1",
    }),
  );
  assertFalse(
    hasAllStateTags({
      r9k: false,
      r9kRaw: "0",
    }),
  );
  assertFalse(
    hasAllStateTags({
      slowModeDuration: 0,
      slowModeDurationRaw: "0",
    }),
  );
  assertFalse(
    hasAllStateTags({
      subscribersOnly: false,
      subscribersOnlyRaw: "0",
    }),
  );
});

Deno.test("RoomstateMessage should be able to parse a fully-populated ROOMSTATE message",
  () => {
    const msgText =
      "@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=40286300;" +
      "slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #randers";

    const msg = parseTwitchMessage(msgText) as RoomstateMessage;

    assertInstanceOf(msg, RoomstateMessage);

    assertStrictEquals(msg.channelName, "randers");

    assertStrictEquals(msg.channelID, "40286300");

    assertStrictEquals(msg.emoteOnly, false);
    assertStrictEquals(msg.emoteOnlyRaw, "0");

    assertStrictEquals(msg.followersOnlyDuration, -1);
    assertStrictEquals(msg.followersOnlyDurationRaw, "-1");

    assertStrictEquals(msg.r9k, false);
    assertStrictEquals(msg.r9kRaw, "0");

    assertStrictEquals(msg.slowModeDuration, 0);
    assertStrictEquals(msg.slowModeDurationRaw, "0");

    assertStrictEquals(msg.subscribersOnly, false);
    assertStrictEquals(msg.subscribersOnlyRaw, "0");

    assertEquals(msg.extractRoomState(), {
      emoteOnly: false,
      emoteOnlyRaw: "0",

      followersOnlyDuration: -1,
      followersOnlyDurationRaw: "-1",

      r9k: false,
      r9kRaw: "0",

      slowModeDuration: 0,
      slowModeDurationRaw: "0",

      subscribersOnly: false,
      subscribersOnlyRaw: "0",
    });

    assertTrue(hasAllStateTags(msg.extractRoomState()));
  });

Deno.test("RoomstateMessage should be able to parse a single property change ROOMSTATE message",
  () => {
    const msgText =
      "@emote-only=1;room-id=40286300 :tmi.twitch.tv ROOMSTATE #randers";

    const msg = parseTwitchMessage(msgText) as RoomstateMessage;

    assertInstanceOf(msg, RoomstateMessage);

    assertStrictEquals(msg.channelName, "randers");

    assertStrictEquals(msg.channelID, "40286300");

    assertStrictEquals(msg.emoteOnly, true);
    assertStrictEquals(msg.emoteOnlyRaw, "1");

    assertStrictEquals(msg.followersOnlyDuration, undefined);
    assertStrictEquals(msg.followersOnlyDurationRaw, undefined);
    assertStrictEquals(msg.r9k, undefined);
    assertStrictEquals(msg.r9kRaw, undefined);
    assertStrictEquals(msg.slowModeDuration, undefined);
    assertStrictEquals(msg.slowModeDurationRaw, undefined);
    assertStrictEquals(msg.subscribersOnly, undefined);
    assertStrictEquals(msg.subscribersOnlyRaw, undefined);

    assertEquals(msg.extractRoomState(), {
      emoteOnly: true,
      emoteOnlyRaw: "1",
    });

    assertFalse(hasAllStateTags(msg.extractRoomState()));
  });
