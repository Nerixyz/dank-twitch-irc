import { assertEquals, assertStrictEquals,} from "https://deno.land/std/testing/asserts.ts";
import {assertTrue, assertFalse}from "https://deno.land/x/explicitly/mod.ts";
import { assertThrowsChain } from "../../helpers.test.ts";
import { TwitchBadge } from "../badge.ts";
import { TwitchBadgesList } from "../badges.ts";
import { TwitchEmote } from "../emote.ts";
import { TwitchEmoteSets } from "./emote-sets.ts";
import { MissingTagError } from "./missing-tag-error.ts";
import { ParseError } from "./parse-error.ts";
import { tagParserFor, TagValueParser } from "./tag-values.ts";

function checkRequire<V, A extends any[]>(
  subject: (
    tagParser: TagValueParser,
  ) => (key: string, ...converterArgs: A) => V,
  ...converterArgs: A
): void {
  assertThrowsChain(
    () => subject(tagParserFor({}))("key", ...converterArgs),
    MissingTagError,
    "Required tag value not present at key \"key\" (is undefined)",
  );
  assertThrowsChain(
    () => subject(tagParserFor({ key: null }))("key", ...converterArgs),
    MissingTagError,
    "Required tag value not present at key \"key\" (is null)",
  );
}

function checkGet<V, A extends any[]>(
  subject: (
    tagParser: TagValueParser,
  ) => (key: string, ...converterArgs: A) => V | undefined,
  ...converterArgs: A
): void {
  assertStrictEquals(subject(tagParserFor({}))("key", ...converterArgs), undefined);
  assertStrictEquals(
    subject(tagParserFor({ key: null }))("key", ...converterArgs),undefined
  );
}

Deno.test("#getString(), #requireString()", () => {
  checkGet((p) => p.getString);
  checkRequire((p) => p.requireString);
});

Deno.test("getString and requireString should return the value if value exists (also on empty string)",
  () => {
  assertStrictEquals(
    tagParserFor({ key: "value" }).getString("key"),
    "value",
  );
  assertStrictEquals(
    tagParserFor({ key: "value" }).requireString("key"),
    "value",
  );
  assertStrictEquals(tagParserFor({ key: "" }).getString("key"), "");
  assertStrictEquals(tagParserFor({ key: "" }).requireString("key"), "");
});

function checkThrowsUnparseableInt<V, A extends any[]>(
  subject: (
    tagParser: TagValueParser,
  ) => (key: string, ...converterArgs: A) => V | undefined,
  ...converterArgs: A
): void {
  assertThrowsChain(
    () => subject(tagParserFor({ key: "" }))("key", ...converterArgs),
    ParseError,
    "Failed to parse integer from tag value \"\"",
  );
  assertThrowsChain(
    () => subject(tagParserFor({ key: "abc" }))("key", ...converterArgs),
    ParseError,
    "Failed to parse integer from tag value \"abc\"",
  );
}

Deno.test("#getInt(), #requireInt()", () => {
  checkGet((p) => p.getInt);
  checkRequire((p) => p.requireInt);

  checkThrowsUnparseableInt((p) => p.getInt);
  checkThrowsUnparseableInt((p) => p.requireInt);
});

Deno.test("getInt and requireInt should return a number if value exists and was parseable", () => {
  assertStrictEquals(15, tagParserFor({ key: "15" }).getInt("key"));
  assertStrictEquals(15, tagParserFor({ key: "15" }).requireInt("key"));
});

Deno.test("#getBoolean(), #requireBoolean()", () => {
  checkGet((p) => p.getBoolean);
  checkRequire((p) => p.requireBoolean);

  checkThrowsUnparseableInt((p) => p.getInt);
  checkThrowsUnparseableInt((p) => p.requireInt);
});

Deno.test("getBoolean should return false if the parsed integer is 0", () => {
  assertFalse(tagParserFor({ key: "0" }).getBoolean("key"));
  assertFalse(tagParserFor({ key: "0.0" }).getBoolean("key"));
});

Deno.test("getBoolean should return false if the parsed integer is non-0", () => {
  assertTrue(tagParserFor({ key: "1" }).getBoolean("key"));
  assertTrue(tagParserFor({ key: "-1" }).getBoolean("key"));
  assertTrue(tagParserFor({ key: "15" }).getBoolean("key"));
  assertTrue(tagParserFor({ key: "-15" }).getBoolean("key"));
});

Deno.test("#getColor(), #requireColor()", () => {
  checkGet((p) => p.getColor);
  checkRequire((p) => p.requireColor);
});

Deno.test("getColor should parse #RRGGBB color input correctly", () => {
  assertEquals(tagParserFor({ key: "#aabbcc" }).getColor("key"), {
    r: 0xaa,
    g: 0xbb,
    b: 0xcc,
  });
  assertEquals(tagParserFor({ key: "#AABBCC" }).getColor("key"), {
    r: 0xaa,
    g: 0xbb,
    b: 0xcc,
  });
  assertEquals(tagParserFor({ key: "#12D3FF" }).getColor("key"), {
    r: 0x12,
    g: 0xd3,
    b: 0xff,
  });
});

Deno.test("#getColor() should return undefined on empty string input", () => {
  assertStrictEquals(tagParserFor({ key: "" }).getColor("key"), undefined);
});

Deno.test("#requireColor() should throw MissingDataError on empty string input", () => {
  assertThrowsChain(
    () => tagParserFor({ key: "" }).requireColor("key"),
    MissingTagError,
    "Required tag value not present at key \"key\" (is empty string)",
  );
});

Deno.test("#getTimestamp(), #requireTimestamp()", () => {
  checkGet((p) => p.getTimestamp);
  checkRequire((p) => p.requireTimestamp);
  checkThrowsUnparseableInt((p) => p.getTimestamp);
  checkThrowsUnparseableInt((p) => p.requireTimestamp);
});

Deno.test("requireTimestamp should interpret given integer values as milliseconds since UTC epoch",
  () => {
  assertStrictEquals(
    tagParserFor({ key: "1234567" }).requireTimestamp("key").getTime(),
    1234567,
  );
});

Deno.test("#getBadges(), #requireBadges()", () => {
  checkGet((p) => p.getBadges);
  checkRequire((p) => p.requireBadges);
});

Deno.test("getBadges should return an empty list on empty string input", () => {
  assertEquals(
    tagParserFor({ key: "" }).getBadges("key"),
    new TwitchBadgesList(),
  );
});

Deno.test("getBadges should return single-element array on single badge", () => {
  assertEquals(
    tagParserFor({ key: "admin/1" }).getBadges("key"),
    new TwitchBadgesList(new TwitchBadge("admin", "1")),
  );
});

Deno.test("getBadges should accept two badges in the tag source", () => {
  assertEquals(
    tagParserFor({ key: "admin/1,subscriber/32" }).getBadges("key"),
    new TwitchBadgesList(
      new TwitchBadge("admin", "1"),
      new TwitchBadge("subscriber", "32"),
    ),
  );
});

Deno.test("getBadges should accept three badges in the tag source", () => {
  assertEquals(
    tagParserFor({ key: "admin/1,subscriber/32,bits/1000" }).getBadges(
      "key",
    ),
    new TwitchBadgesList(
      new TwitchBadge("admin", "1"),
      new TwitchBadge("subscriber", "32"),
      new TwitchBadge("bits", "1000"),
    ),
  );
});

Deno.test("#getEmotes(), #requireEmoteSets()", () => {
  checkGet((p) => p.getEmotes, "lul");
  checkRequire<TwitchEmoteSets, string[]>((p) => p.requireEmoteSets, "lul");
});

Deno.test("should return an empty list on empty string input", () => {
  const actual = tagParserFor({ key: "" }).getEmotes("key", "test");
  assertEquals(actual, []);
});

Deno.test("should return single-element array on single emote", () => {
  const actual = tagParserFor({ key: "25:4-8" }).getEmotes(
    "key",
    "asd Kappa def",
  );
  assertEquals(actual, [new TwitchEmote("25", 4, 9, "Kappa")]);
});

Deno.test("should return 2-element array on 2 identical emotes", () => {
  const actual = tagParserFor({ key: "25:4-8,14-18" }).getEmotes(
    "key",
    "asd Kappa def Kappa def",
  );
  assertEquals(actual, [
    new TwitchEmote("25", 4, 9, "Kappa"),
    new TwitchEmote("25", 14, 19, "Kappa"),
  ]);
});

Deno.test("should return 2-element array on 2 different emotes", () => {
  const actual = tagParserFor({ key: "25:4-8/1902:14-18" }).getEmotes(
    "key",
    "asd Kappa def Keepo def",
  );
  assertEquals(actual, [
    new TwitchEmote("25", 4, 9, "Kappa"),
    new TwitchEmote("1902", 14, 19, "Keepo"),
  ]);
});

Deno.test("should return a correctly sorted 3-element array on interleaved emotes", () => {
  const actual = tagParserFor({ key: "25:5-9,27-31/1902:16-20" }).getEmotes(
    "key",
    "test Kappa test Keepo test Kappa",
  );
  assertEquals(actual, [
    new TwitchEmote("25", 5, 10, "Kappa"),
    new TwitchEmote("1902", 16, 21, "Keepo"),
    new TwitchEmote("25", 27, 32, "Kappa"),
  ]);
});


Deno.test("#getEmoteSets(), #requireEmoteSets()", () => {
  checkGet((p) => p.getEmoteSets);
  checkRequire((p) => p.requireEmoteSets);
});

Deno.test("getEmoteSets should return an empty list on empty string input", () => {
  const actual = tagParserFor({ key: "" }).getEmoteSets("key");
  assertEquals(actual, []);
});

Deno.test("getEmoteSets should parse one emote set correctly", () => {
  const actual = tagParserFor({ key: "0" }).getEmoteSets("key");
  assertEquals(actual, ["0"]);
});

Deno.test("getEmoteSets should parse two emote set correctly", () => {
  const actual = tagParserFor({ key: "0,3343" }).getEmoteSets("key");
  assertEquals(actual, ["0", "3343"]);
});

Deno.test("getEmoteSets should parse three emote set correctly", () => {
  // also tests that function preserves order (no sorting)
  const actual = tagParserFor({ key: "0,7897,3343" }).getEmoteSets("key");
  assertEquals(actual, ["0", "7897", "3343"]);
});
