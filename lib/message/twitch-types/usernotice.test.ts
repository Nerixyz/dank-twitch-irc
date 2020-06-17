import { assertStrictEquals, assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { TwitchBadge } from "../badge.ts";
import { TwitchBadgesList } from "../badges.ts";
import { TwitchEmote } from "../emote.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import {
  extractEventParams,
  ResubUsernoticeMessage,
  SubEventParams,
  UsernoticeMessage,
} from "./usernotice.ts";
import { assertInstanceOf, assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";

const expectType = <T>(args: T): T => args;

Deno.test("extractEventParams should camelCase all properties that start with msg-param-",
  () => {
    assertEquals(
      extractEventParams({
        "msg-param-user-name": "pajlada",
        "msg-id": "abc123efg",
        "msg-parameter-msg-id": "987398274923",
      }),
      {
        username: "pajlada",
      },
    );
  });

Deno.test("extractEventParams  should parse integer properties and add a raw- property for them",
  () => {
    assertEquals(
      extractEventParams({
        "msg-param-months": "12",
      }),
      {
        months: 12,
        monthsRaw: "12",
      },
    );
  });

Deno.test("extractEventParams should parse boolean properties and add a raw- property for them",
  () => {
    assertEquals(
      extractEventParams({
        "msg-param-should-share-streak": "1",
      }),
      {
        shouldShareStreak: true,
        shouldShareStreakRaw: "1",
      },
    );

    assertEquals(
      extractEventParams({
        "msg-param-should-share-streak": "0",
      }),
      {
        shouldShareStreak: false,
        shouldShareStreakRaw: "0",
      },
    );
  });

Deno.test("extractEventParams should camelCase -id as ID", () => {
  assertEquals(
    extractEventParams({
      "msg-param-user-id": "1234567",
    }),
    {
      userID: "1234567",
    },
  );
});

Deno.test("UsernoticeMessage should be able to parse a USERNOTICE with no message, only system-msg",
  () => {
    const msgText =
      "@badge-info=subscriber/5;badges=subscriber/3;color=;display-name=kakarot127;" +
      "emotes=;flags=;id=5dc14bb3-684b-4c04-8fbb-3c870958ac69;login=kakarot127;mod=0;msg-id=resub;" +
      "msg-param-cumulative-months=5;msg-param-months=0;msg-param-should-share-streak=0;" +
      "msg-param-sub-plan-name=Channel\\sSubscription\\s(faker);msg-param-sub-plan=1000;" +
      "room-id=43691;subscriber=1;system-msg=kakarot127\\ssubscribed\\sat\\sTier\\s1.\\sThey'" +
      "ve\\ssubscribed\\sfor\\s5\\smonths!;tmi-sent-ts=1563102742440;user-id=147030570;user-type= " +
      ":tmi.twitch.tv USERNOTICE #faker";

    const msg = parseTwitchMessage(msgText) as UsernoticeMessage;

    assertInstanceOf(msg, UsernoticeMessage);

    assertStrictEquals(msg.channelName, "faker");
    assertStrictEquals(msg.channelID, "43691");

    assertStrictEquals(msg.messageText, undefined);
    assertStrictEquals(
      msg.systemMessage,
      "kakarot127 subscribed at Tier 1. They've subscribed " + "for 5 months!",
    );
    assertStrictEquals(msg.messageTypeID, "resub");

    assertStrictEquals(msg.senderUsername, "kakarot127");
    assertStrictEquals(msg.senderUserID, "147030570");

    assertEquals(
      msg.badgeInfo,
      new TwitchBadgesList(new TwitchBadge("subscriber", "5")),
    );
    assertStrictEquals(msg.badgeInfoRaw, "subscriber/5");

    assertStrictEquals(msg.bits, undefined);
    assertStrictEquals(msg.bitsRaw, undefined);

    assertStrictEquals(msg.color, undefined);
    assertStrictEquals(msg.colorRaw, "");

    assertStrictEquals(msg.displayName, "kakarot127");
    assertEquals(msg.emotes, []);
    assertEquals(msg.emotesRaw, "");

    assertStrictEquals(msg.isMod, false);
    assertStrictEquals(msg.isModRaw, "0");

    assertStrictEquals(msg.serverTimestamp.getTime(), 1563102742440);
    assertStrictEquals(msg.serverTimestampRaw, "1563102742440");

    assertEquals(msg.eventParams, {
      cumulativeMonths: 5,
      cumulativeMonthsRaw: "5",
      months: 0,
      monthsRaw: "0",
      shouldShareStreak: false,
      shouldShareStreakRaw: "0",
      subPlanName: "Channel Subscription (faker)",
      subPlan: "1000",
    });

    assertTrue(msg.isResub());
    assertFalse(msg.isCheer());

    // typescript test:
    if (msg.isResub()) {
      expectType<ResubUsernoticeMessage>(msg);
      expectType<SubEventParams>(msg.eventParams);
      expectType<number>(msg.eventParams.cumulativeMonths);
      expectType<string>(msg.eventParams.cumulativeMonthsRaw);
    }
  });

Deno.test("UsernoticeMessage should be able to parse a resub with message", () => {
  const msg = parseTwitchMessage(
    "@badge-info=subscriber/15;badges=subscriber/12;color=#00CCBE" +
    ";display-name=5weatyNuts;emotes=1076725:0-10;flags=;id=fda4d92" +
    "4-cde3-421d-8eea-713401194446;login=5weatynuts;mod=0;msg-id=resu" +
    "b;msg-param-cumulative-months=15;msg-param-months=0;msg-param-sh" +
    "ould-share-streak=0;msg-param-sub-plan-name=Channel\\sSubscripti" +
    "on\\s(dafrancsgo);msg-param-sub-plan=Prime;room-id=41314239;subs" +
    "criber=1;system-msg=5weatyNuts\\ssubscribed\\swith\\sTwitch\\sPri" +
    "me.\\sThey've\\ssubscribed\\sfor\\s15\\smonths!;tmi-sent-ts=1565" +
    "699032594;user-id=169613447;user-type= :tmi.twitch.tv USERNOTICE " +
    "#dafran :dafranPrime Clap",
  ) as UsernoticeMessage;

  assertStrictEquals(msg.messageText, "dafranPrime Clap");
  assertEquals(msg.emotes, [
    new TwitchEmote("1076725", 0, 11, "dafranPrime"),
  ]);
  assertStrictEquals(msg.emotesRaw, "1076725:0-10");

  assert(msg.isResub());
});
