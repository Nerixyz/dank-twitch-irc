import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertThrowsChain } from "../../helpers.test.ts";
import { IRCMessage } from "../irc/irc-message.ts";
import { parseIRCMessage } from "./irc-message.ts";
import { ParseError } from "./parse-error.ts";


Deno.test("parseIRCMessage should throw a ParseError on empty string input", () => {
  assertThrowsChain(
    () => parseIRCMessage(""),
    ParseError,
    "Invalid format for IRC command (given src: \"\")",
  );
});
Deno.test("parseIRCMessage should throw a ParseError on malformed input", () => {
  // double space
  assertThrowsChain(
    () => parseIRCMessage(":tmi.twitch.tv  PRIVMSG"),
    ParseError,
    "Invalid format for IRC command (given src: \":tmi.twitch.tv  PRIVMSG\")",
  );
});
Deno.test("parseIRCMessage should error on empty prefix", () => {
  assertThrowsChain(
    () => parseIRCMessage(": PING xD"),
    ParseError,
    "Empty prefix declaration (nothing after : sign) (given src: \": PING xD\")",
  );
  assertThrowsChain(
    () => parseIRCMessage(":a@ PING xD"),
    ParseError,
    "Host, nick or user is empty in prefix (given src: \":a@ PING xD\")",
  );
  assertThrowsChain(
    () => parseIRCMessage(":a!@b PING xD"),
    ParseError,
    "Host, nick or user is empty in prefix (given src: \":a!@b PING xD\")",
  );
});
Deno.test("parseIRCMessage should parse this one", () => {
  parseIRCMessage(
    ":justinfan12345.tmi.twitch.tv 353 justinfan12345 = #pajlada :justinfan12345",
  );
});
Deno.test("parseIRCMessage should parse tags optionally", () => {
  const actual = parseIRCMessage(
    ":tetyys!tetyys@tetyys.tmi.twitch.tv PRIVMSG #pajlada :KKona",
  );
  const expected = new IRCMessage({
    rawSource:
      ":tetyys!tetyys@tetyys.tmi.twitch.tv PRIVMSG #pajlada :KKona",
    ircPrefixRaw: "tetyys!tetyys@tetyys.tmi.twitch.tv",
    ircPrefix: {
      nickname: "tetyys",
      username: "tetyys",
      hostname: "tetyys.tmi.twitch.tv",
    },
    ircCommand: "PRIVMSG",
    ircParameters: ["#pajlada", "KKona"],
    ircTags: {},
  });

  assertEquals(actual, expected);
});
Deno.test("parseIRCMessage should parse tags", () => {
  const actual = parseIRCMessage("@abc=def;kkona=kkona;def;def PONG");
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: "@abc=def;kkona=kkona;def;def PONG",
      ircPrefixRaw: undefined,
      ircPrefix: undefined,
      ircCommand: "PONG",
      ircParameters: [],
      ircTags: {
        abc: "def",
        kkona: "kkona",
        def: null,
      },
    }),
  );
});
Deno.test("parseIRCMessage should parse prefix optionally", () => {
  const actual = parseIRCMessage("PONG :tmi.twitch.tv");
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: "PONG :tmi.twitch.tv",
      ircPrefixRaw: undefined,
      ircPrefix: undefined,
      ircCommand: "PONG",
      ircParameters: ["tmi.twitch.tv"],
      ircTags: {},
    }),
  );
});
Deno.test("parseIRCMessage should parse multiple middle parameters", () => {
  const actual = parseIRCMessage("PONG a b cd");
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: "PONG a b cd",
      ircPrefixRaw: undefined,
      ircPrefix: undefined,
      ircCommand: "PONG",
      ircParameters: ["a", "b", "cd"],
      ircTags: {},
    }),
  );
});
Deno.test("parseIRCMessage should allow \":\" character in middle parameters", () => {
  const actual = parseIRCMessage("PONG a:b b: :cd");
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: "PONG a:b b: :cd",
      ircPrefixRaw: undefined,
      ircPrefix: undefined,
      ircCommand: "PONG",
      ircParameters: ["a:b", "b:", "cd"],
      ircTags: {},
    }),
  );
});
Deno.test("parseIRCMessage should uppercase the command", () => {
  const actual = parseIRCMessage("pong");
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: "pong",
      ircPrefixRaw: undefined,
      ircPrefix: undefined,
      ircCommand: "PONG",
      ircParameters: [],
      ircTags: {},
    }),
  );
});
Deno.test("parseIRCMessage should recognize host-only prefixes", () => {
  const actual = parseIRCMessage(":tmi.twitch.tv PING");
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: ":tmi.twitch.tv PING",
      ircPrefixRaw: "tmi.twitch.tv",
      ircPrefix: {
        nickname: undefined,
        username: undefined,
        hostname: "tmi.twitch.tv",
      },
      ircCommand: "PING",
      ircParameters: [],
      ircTags: {},
    }),
  );
});
Deno.test("parseIRCMessage should recognize server-only prefixes", () => {
  const actual = parseIRCMessage(":leppunen PRIVMSG");
  // note: this could also be a nickname-only prefix but those
  // don't really exist on Twitch so we assume a :<single thing>
  // prefix to be a hostname regardless of content
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: ":leppunen PRIVMSG",
      ircPrefixRaw: "leppunen",
      ircPrefix: {
        nickname: undefined,
        username: undefined,
        hostname: "leppunen",
      },
      ircCommand: "PRIVMSG",
      ircParameters: [],
      ircTags: {},
    }),
  );
});
Deno.test("parseIRCMessage should recognize full prefixes", () => {
  const actual = parseIRCMessage(
    ":leppunen!crazyusername@local.host PRIVMSG",
  );
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: ":leppunen!crazyusername@local.host PRIVMSG",
      ircPrefixRaw: "leppunen!crazyusername@local.host",
      ircPrefix: {
        nickname: "leppunen",
        username: "crazyusername",
        hostname: "local.host",
      },
      ircCommand: "PRIVMSG",
      ircParameters: [],
      ircTags: {},
    }),
  );
});
Deno.test("parseIRCMessage should allow numeric commands", () => {
  const actual = parseIRCMessage("001");
  assertEquals(
    actual,
    new IRCMessage({
      rawSource: "001",
      ircPrefixRaw: undefined,
      ircPrefix: undefined,
      ircCommand: "001",
      ircParameters: [],
      ircTags: {},
    }),
  );
});
Deno.test("parseIRCMessage should only allow 3-digit numeric commands", () => {
  assertThrowsChain(
    () => parseIRCMessage("01"),
    ParseError,
    "Invalid format for IRC command (given src: \"01\")",
  );
  assertThrowsChain(
    () => parseIRCMessage("0001"),
    ParseError,
    "Invalid format for IRC command (given src: \"0001\")",
  );
});

Deno.test("parseIRCMessage should allow underscores in usernames", () => {
  const actual = parseIRCMessage(
    "@historical=1;badge-info=subscriber/4;" +
    "badges=subscriber/3,sub-gifter/1;color=#492F2F;" +
    "display-name=Billy_Bones_U;emotes=;flags=;id=d3805a32-df90-4844-a3ab" +
    "-4ea116fcf1c6;mod=0;room-id=11148817;subscriber=1;tmi-sent-ts=15656850" +
    "67248;turbo=0;user-id=411604091;user-type= :billy_bones_u!billy_bones_" +
    "u@billy_bones_u.tmi.twitch.tv PRIVMSG #pajlada :FeelsDankMan ...",
  );

  assertEquals(
    actual,
    new IRCMessage({
      rawSource:
        "@historical=1;badge-info=subscriber/4;" +
        "badges=subscriber/3,sub-gifter/1;color=#492F2F;" +
        "display-name=Billy_Bones_U;emotes=;flags=;id=d3805a32-df90-4844-a3ab" +
        "-4ea116fcf1c6;mod=0;room-id=11148817;subscriber=1;tmi-sent-ts=15656850" +
        "67248;turbo=0;user-id=411604091;user-type= :billy_bones_u!billy_bones_" +
        "u@billy_bones_u.tmi.twitch.tv PRIVMSG #pajlada :FeelsDankMan ...",
      ircPrefixRaw: "billy_bones_u!billy_bones_u@billy_bones_u.tmi.twitch.tv",
      ircPrefix: {
        hostname: "billy_bones_u.tmi.twitch.tv",
        nickname: "billy_bones_u",
        username: "billy_bones_u",
      },
      ircParameters: ["#pajlada", "FeelsDankMan ..."],
      ircCommand: "PRIVMSG",
      ircTags: {
        "historical": "1",
        "badge-info": "subscriber/4",
        "badges": "subscriber/3,sub-gifter/1",
        "color": "#492F2F",
        "display-name": "Billy_Bones_U",
        "emotes": "",
        "flags": "",
        "id": "d3805a32-df90-4844-a3ab-4ea116fcf1c6",
        "mod": "0",
        "room-id": "11148817",
        "subscriber": "1",
        "tmi-sent-ts": "1565685067248",
        "turbo": "0",
        "user-id": "411604091",
        "user-type": "",
      },
    }),
  );
});
