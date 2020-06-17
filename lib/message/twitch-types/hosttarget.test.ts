import { assertEquals, assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertThrowsChain } from "../../helpers.test.ts";
import { MissingDataError } from "../parser/missing-data-error.ts";
import { ParseError } from "../parser/parse-error.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import {
  HosttargetMessage,
  parseHostedChannelName,
  parseHosttargetParameter,
  parseViewerCount,
} from "./hosttarget.ts";
import { assertInstanceOf, assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";

Deno.test("parseHostedChannelName should throw a ParseError if passed undefined", () => {
  assertThrowsChain(
    () => parseHostedChannelName(undefined),
    ParseError,
    "Malformed channel part in HOSTTARGET message: undefined",
  );
});

Deno.test("parseHostedChannelName should throw a ParseError if passed an empty string", () => {
  assertThrowsChain(
    () => parseHostedChannelName(""),
    ParseError,
    "Malformed channel part in HOSTTARGET message: empty string",
  );
});

Deno.test("parseHostedChannelName should return undefined if passed exactly \"-\"", () => {
  assertStrictEquals(parseHostedChannelName("-"), undefined);
});

Deno.test("parseHostedChannelName should return the input string as-is in all other cases",
  () => {
    assertStrictEquals("a", parseHostedChannelName("a"));
    assertStrictEquals("xd", parseHostedChannelName("xd"));
    assertStrictEquals("pajlada", parseHostedChannelName("pajlada"));
  });

Deno.test("parseViewerCount should throw a ParseError if passed undefined", () => {
  assertThrowsChain(
    () => parseViewerCount(undefined),
    ParseError,
    "Malformed viewer count part in HOSTTARGET message: undefined",
  );
});

Deno.test("parseViewerCount should throw a ParseError if passed an empty string", () => {
  assertThrowsChain(
    () => parseViewerCount(""),
    ParseError,
    "Malformed viewer count part in HOSTTARGET message: empty string",
  );
});

Deno.test("parseViewerCount should throw a ParseError if passed an invalid integer string",
  () => {
    assertThrowsChain(
      () => parseViewerCount("abc"),
      ParseError,
      "Malformed viewer count part in HOSTTARGET message: \"abc\"",
    );
  });

Deno.test("parseViewerCount should return undefined if passed exactly \"-\"", () => {
  assertStrictEquals(parseViewerCount("-"), undefined);
});

Deno.test("parseViewerCount should return a parsed number if passed a value integer value",
  () => {
    assertStrictEquals(0, parseViewerCount("0"));
    assertStrictEquals(50, parseViewerCount("50"));
  });

Deno.test("parsHosttargetParameter should throw a ParseError if passed an empty string",
  () => {
    assertThrowsChain(
      () => parseHosttargetParameter(""),
      ParseError,
      "HOSTTARGET accepts exactly 2 arguments in second parameter, given: empty string",
    );
  });

Deno.test("parsHosttargetParameter should throw a ParseError if given more than 2 arguments",
  () => {
    assertThrowsChain(
      () => parseHosttargetParameter("a b c"),
      ParseError,
      "HOSTTARGET accepts exactly 2 arguments in second parameter, given: \"a b c\"",
    );
  });

Deno.test("parsHosttargetParameter should parse channel name and viewer count if present",
  () => {
    assertEquals(parseHosttargetParameter("leebaxd 10"), {
      hostedChannelName: "leebaxd",
      viewerCount: 10,
    });
    assertEquals(parseHosttargetParameter("leebaxd -"), {
      hostedChannelName: "leebaxd",
      viewerCount: undefined,
    });
    assertEquals(parseHosttargetParameter("- 10"), {
      hostedChannelName: undefined,
      viewerCount: 10,
    });
    assertEquals(parseHosttargetParameter("- 0"), {
      hostedChannelName: undefined,
      viewerCount: 0,
    });
    assertEquals(parseHosttargetParameter("- -"), {
      hostedChannelName: undefined,
      viewerCount: undefined,
    });
  });
Deno.test("HosttargetMessage should parse fresh Host-On message", () => {
  const msgText = ":tmi.twitch.tv HOSTTARGET #randers :leebaxd 0";

  const msg: HosttargetMessage = parseTwitchMessage(
    msgText,
  ) as HosttargetMessage;

  assertInstanceOf(msg, HosttargetMessage);

  assertStrictEquals(msg.channelName, "randers");
  assertStrictEquals(msg.hostedChannelName, "leebaxd");
  assertStrictEquals(msg.viewerCount, 0);

  assertFalse(msg.wasHostModeExited());
  assertTrue(msg.wasHostModeEntered());
});

Deno.test("HosttargetMessage should parse non-fresh Host-On message", () => {
  const msgText = ":tmi.twitch.tv HOSTTARGET #randers :leebaxd -";

  const msg: HosttargetMessage = parseTwitchMessage(
    msgText,
  ) as HosttargetMessage;

  assertInstanceOf(msg, HosttargetMessage);

  assertStrictEquals(msg.channelName, "randers");
  assertStrictEquals(msg.hostedChannelName, "leebaxd");
  assertStrictEquals(msg.viewerCount, undefined);

  assertFalse(msg.wasHostModeExited());
  assertTrue(msg.wasHostModeEntered());
});

Deno.test("HosttargetMessage should parse host exit message", () => {
  const msgText = ":tmi.twitch.tv HOSTTARGET #randers :- 0";

  const msg: HosttargetMessage = parseTwitchMessage(
    msgText,
  ) as HosttargetMessage;

  assertInstanceOf(msg, HosttargetMessage);

  assertStrictEquals(msg.channelName, "randers");
  assertStrictEquals(msg.hostedChannelName, undefined);
  assertStrictEquals(msg.viewerCount, 0);

  assertTrue(msg.wasHostModeExited());
  assertFalse(msg.wasHostModeEntered());
});

Deno.test("HosttargetMessage should require a second IRC parameter to be present", () => {
  const msgText = ":tmi.twitch.tv HOSTTARGET #randers";

  assertThrowsChain(
    () => parseTwitchMessage(msgText),
    MissingDataError,
    "Parameter at index 1 missing",
  );
});
