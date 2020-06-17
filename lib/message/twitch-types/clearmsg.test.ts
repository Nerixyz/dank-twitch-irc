import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { ClearmsgMessage } from "./clearmsg.ts";


Deno.test("ClearmsgMessage should be able to parse a real CLEARMSG message from twitch", () => {
  const msgText =
    "@login=supibot;room-id=;target-msg-id=25fd76d9-4731-4907-978e-a391134ebd67;" +
    "tmi-sent-ts=-6795364578871 :tmi.twitch.tv CLEARMSG #randers :Pong! Uptime: 6h, " +
    "15m; Temperature: 54.8°C; Latency to TMI: 183ms; Commands used: 795";

  const msg: ClearmsgMessage = parseTwitchMessage(
    msgText,
  ) as ClearmsgMessage;

  assertStrictEquals(Object.getPrototypeOf(msg), ClearmsgMessage.prototype);
  assertStrictEquals(msg.channelName, "randers");
  assertStrictEquals(msg.targetUsername, "supibot");
  assertStrictEquals(
    msg.targetMessageID,
    "25fd76d9-4731-4907-978e-a391134ebd67",
  );
  assertStrictEquals(
    msg.targetMessageContent,
    "Pong! Uptime: 6h, 15m; Temperature: 54.8°C; " +
    "Latency to TMI: 183ms; Commands used: 795",
  );
});
