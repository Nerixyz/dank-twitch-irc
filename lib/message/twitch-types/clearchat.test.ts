import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { ClearchatMessage } from "./clearchat.ts";
import { assertInstanceOf, assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("ClearchatMessage should be able to parse a real CLEARCHAT timeout message from twitch",
  () => {
    const msgText =
      "@ban-duration=600;room-id=40286300;target-user-id=70948394;" +
      "tmi-sent-ts=1563051113633 :tmi.twitch.tv CLEARCHAT #randers :weeb123";

    const msg: ClearchatMessage = parseTwitchMessage(
      msgText,
    ) as ClearchatMessage;

    assertInstanceOf(msg, ClearchatMessage);

    assertStrictEquals(msg.channelName, "randers");
    assertStrictEquals(msg.targetUsername, "weeb123");
    assertStrictEquals(msg.banDuration, 600);
    assertFalse(msg.wasChatCleared());
    assertTrue(msg.isTimeout());
    assertFalse(msg.isPermaban());
  });

Deno.test("ClearchatMessage should be able to parse a real CLEARCHAT ban message from twitch",
  () => {
    const msgText =
      "@room-id=40286300;target-user-id=70948394;tmi-sent-ts=1563051758128 " +
      ":tmi.twitch.tv CLEARCHAT #randers :weeb123";

    const msg: ClearchatMessage = parseTwitchMessage(
      msgText,
    ) as ClearchatMessage;

    assertInstanceOf(msg, ClearchatMessage);

    assertStrictEquals(msg.channelName, "randers");
    assertStrictEquals(msg.targetUsername, "weeb123");
    assertStrictEquals(msg.banDuration, undefined);
    assertFalse(msg.wasChatCleared());
    assertFalse(msg.isTimeout());
    assertTrue(msg.isPermaban());
  });

Deno.test("ClearchatMessage should be able to parse a real CLEARCHAT chat clear message from twitch",
  () => {
    const msgText =
      "@room-id=40286300;tmi-sent-ts=1563051778390 :tmi.twitch.tv CLEARCHAT #randers";

    const msg: ClearchatMessage = parseTwitchMessage(
      msgText,
    ) as ClearchatMessage;

    assertInstanceOf(msg, ClearchatMessage);

    assertStrictEquals(msg.channelName, "randers");
    assertStrictEquals(msg.targetUsername, undefined);
    assertStrictEquals(msg.banDuration, undefined);
    assertTrue(msg.wasChatCleared());
    assertFalse(msg.isTimeout());
    assertFalse(msg.isPermaban());
  });
