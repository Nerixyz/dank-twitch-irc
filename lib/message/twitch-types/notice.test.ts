import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { NoticeMessage } from "./notice.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";

Deno.test("NoticeMessage should parse a normal NOTICE sent by the twitch server", () => {
  const msgText =
    "@msg-id=msg_banned :tmi.twitch.tv NOTICE #forsen " +
    ":You are permanently banned from talking in forsen.";

  const msg: NoticeMessage = parseTwitchMessage(msgText) as NoticeMessage;

  assertInstanceOf(msg, NoticeMessage);

  assertStrictEquals(msg.channelName, "forsen");
  assertStrictEquals(
    msg.messageText,
    "You are permanently banned from talking in forsen.",
  );
  assertStrictEquals(msg.messageID, "msg_banned");
});

Deno.test("NoticeMessage should parse a NOTICE message received before successfuly login",
  () => {
    const msgText = ":tmi.twitch.tv NOTICE * :Improperly formatted auth";

    const msg: NoticeMessage = parseTwitchMessage(msgText) as NoticeMessage;

    assertInstanceOf(msg, NoticeMessage);

    assertStrictEquals(msg.channelName, undefined);
    assertStrictEquals(msg.messageText, "Improperly formatted auth");
    assertStrictEquals(msg.messageID, undefined);
  });
