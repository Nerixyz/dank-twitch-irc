import { parseTwitchMessage } from "../../parser/twitch-message.ts";
import { ReconnectMessage } from "./reconnect.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("ReconnectMessage should be able to parse a real RECONNECT message", () => {
  const msg = parseTwitchMessage(
    ":tmi.twitch.tv RECONNECT",
  ) as ReconnectMessage;

  assertInstanceOf(msg, ReconnectMessage);
});
