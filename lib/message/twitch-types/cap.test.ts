import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { CapMessage } from "./cap.ts";


Deno.test("CapMessage should parse a single CAP ACK message", () => {
  const msgText = ":tmi.twitch.tv CAP * ACK :twitch.tv/commands";

  const msg = parseTwitchMessage(msgText) as CapMessage;

  assertInstanceOf(msg, CapMessage);

  assertStrictEquals(msg.subCommand, "ACK");
  assertEquals(msg.capabilities, ["twitch.tv/commands"]);
});

Deno.test("CapMessage should parse multiple capabilities CAP ACK message", () => {
  const msgText =
    ":tmi.twitch.tv CAP * ACK :twitch.tv/commands twitch.tv/tags twitch.tv/membership";

  const msg = parseTwitchMessage(msgText) as CapMessage;

  assertInstanceOf(msg, CapMessage);

  assertStrictEquals(msg.subCommand, "ACK");
  assertEquals(msg.capabilities, [
    "twitch.tv/commands",
    "twitch.tv/tags",
    "twitch.tv/membership",
  ]);
});

Deno.test("CapMessage should parse a CAP NAK message", () => {
  const msgText = ":tmi.twitch.tv CAP * NAK :invalid twitch.tv/invalid";

  const msg = parseTwitchMessage(msgText) as CapMessage;

  assertInstanceOf(msg, CapMessage);

  assertStrictEquals(msg.subCommand, "NAK");
  assertEquals(msg.capabilities, [
    "invalid",
    "twitch.tv/invalid",
  ]);
});

Deno.test("CapMessage should parse a CAP LS message", () => {
  const msgText =
    ":tmi.twitch.tv CAP * LS :twitch.tv/tags twitch.tv/commands twitch.tv/membership";

  const msg = parseTwitchMessage(msgText) as CapMessage;

  assertInstanceOf(msg, CapMessage);

  assertStrictEquals(msg.subCommand, "LS");
  assertEquals(msg.capabilities, [
    "twitch.tv/tags",
    "twitch.tv/commands",
    "twitch.tv/membership",
  ]);
});
