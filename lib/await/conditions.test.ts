import { parseTwitchMessage } from "../message/parser/twitch-message.ts";
import { matchingNotice } from "./conditions.ts";
import {assertFalse, assertTrue} from "https://deno.land/x/explicitly/mod.ts";


Deno.test("should not match anything that's not a NOTICE", () => {
  const msg = parseTwitchMessage(
    "@msg-id=timeout_success :tmi.twitch.tv TEST #pajlada :WEEB123 has been timed out for 1 second.",
  );
  assertFalse(matchingNotice("pajlada", ["timeout_success"])(msg));
});

Deno.test("should not match anything from the wrong channel", () => {
  const msg = parseTwitchMessage(
    "@msg-id=timeout_success :tmi.twitch.tv NOTICE #forsen :WEEB123 has been timed out for 1 second.",
  );
  assertFalse(matchingNotice("pajlada", ["timeout_success"])(msg));
});

Deno.test("should not match any non-matching notice IDs", () => {
  const msg = parseTwitchMessage(
    "@msg-id=timeout_success :tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second.",
  );
  assertFalse(matchingNotice("pajlada", ["timeout_success_lol"])(msg));
  assertTrue(matchingNotice("pajlada", ["timeout_success"])(msg));
});

Deno.test("should return false if msg-id is not present on the NOTICE message", () => {
  const msg = parseTwitchMessage(
    ":tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second.",
  );
  assertFalse(matchingNotice("pajlada", ["timeout_success"])(msg));
});

Deno.test("parseTwitchMessage should return true for matching message", () => {
  const msg1 = parseTwitchMessage(
    "@msg-id=timeout_success :tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second.",
  );
  assertTrue(
    matchingNotice("pajlada", ["timeout_success", "lol"])(msg1),
  );

  const msg2 = parseTwitchMessage(
    "@msg-id=lol :tmi.twitch.tv NOTICE #pajlada :WEEB123 has been timed out for 1 second.",
  );
  assertTrue(
    matchingNotice("pajlada", ["timeout_success", "lol"])(msg2),
  );
});
