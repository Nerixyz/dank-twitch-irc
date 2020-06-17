import { assertThrowsChain } from "../../helpers.test.ts";
import { parseIRCMessage } from "../parser/irc-message.ts";
import { MissingDataError } from "../parser/missing-data-error.ts";
import { ParseError } from "../parser/parse-error.ts";
import { ChannelIRCMessage, getIRCChannelName } from "./channel-irc-message.ts";
import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";


Deno.test("getIRCChannelName should return valid channel names, trimmed of the leading # character",
  () => {
    assertStrictEquals(
      getIRCChannelName({ ircParameters: ["#pajlada"] }),
      "pajlada",
    );
    assertStrictEquals(getIRCChannelName({ ircParameters: ["#a"] }), "a");
    assertStrictEquals(
      getIRCChannelName({ ircParameters: ["#a", "more arguments"] }),
      "a",
    );
    assertStrictEquals(
      getIRCChannelName({ ircParameters: ["#a", "more", "arguments"] }),
      "a",
    );
  });

Deno.test("getIRCChannelName should handle chatroom channel ID normally", () => {
  const ircParameters = [
    "#chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386",
    "more",
    "arguments",
  ];
  assertStrictEquals(
    getIRCChannelName({ ircParameters }),
    "chatrooms:11148817:85c31777-b181-46ab-8e08-73e4ecd7a386",
  );
});

Deno.test("getIRCChannelName should throw ParseError if no argument is present", () => {
  assertThrowsChain(
    () => getIRCChannelName({ ircParameters: [] }),
    MissingDataError,
    "Parameter at index 0 missing",
  );
});

Deno.test("getIRCChannelName should throw ParseError on empty first argument", () => {
  assertThrowsChain(
    () => getIRCChannelName({ ircParameters: [""] }),
    ParseError,
    "Received malformed IRC channel name \"\"",
  );
});

Deno.test(
  "getIRCChannelName should throw ParseError if argument does not begin with a # character",
  () => {
    assertThrowsChain(
      () => getIRCChannelName({ ircParameters: ["abc"] }),
      ParseError,
      "Received malformed IRC channel name \"abc\"",
    );
    assertThrowsChain(
      () => getIRCChannelName({ ircParameters: ["pajlada"] }),
      ParseError,
      "Received malformed IRC channel name \"pajlada\"",
    );
  });

Deno.test("getIRCChannelName should throw ParseError on standalone # character", () => {
  assertThrowsChain(
    () => getIRCChannelName({ ircParameters: ["#"] }),
    ParseError,
    "Received malformed IRC channel name \"#\"",
  );
});

Deno.test("ChannelIRCMessage should parse argument 0 into #channelName", () => {
  const msg = new ChannelIRCMessage(parseIRCMessage("PRIVMSG #pajlada"));
  assertStrictEquals(msg.channelName, "pajlada");
});

Deno.test("ChannelIRCMessage should throw ParseError on error parsing the channel name",
  () => {
    // some examples from above
    assertThrowsChain(
      () => new ChannelIRCMessage(parseIRCMessage("PRIVMSG #")),
      ParseError,
      "Received malformed IRC channel name \"#\"",
    );
    assertThrowsChain(
      () => new ChannelIRCMessage(parseIRCMessage("PRIVMSG :")),
      ParseError,
      "Received malformed IRC channel name \"\"",
    );
    assertThrowsChain(
      () => new ChannelIRCMessage(parseIRCMessage("PRIVMSG")),
      MissingDataError,
      "Parameter at index 0 missing",
    );
  });