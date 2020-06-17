import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertThrowsChain } from "../../helpers.test.ts";
import { TwitchEmote } from "../emote.ts";
import { parseEmotes } from "./emotes.ts";
import { ParseError } from "./parse-error.ts";

Deno.test("parseEmotes should parse empty string as no emotes", () => {
  assertEquals(parseEmotes("", ""), []);
});

Deno.test("parseEmotes should parse single emote", () => {
  assertEquals(parseEmotes(":)", "1:0-1"), [
    new TwitchEmote("1", 0, 2, ":)"),
  ]);
});

Deno.test("parseEmotes should parse multiple instances of the same emote", () => {
  assertEquals(parseEmotes(":) :)", "1:0-1,3-4"), [
    new TwitchEmote("1", 0, 2, ":)"),
    new TwitchEmote("1", 3, 5, ":)"),
  ]);
});

Deno.test("parseEmotes should parse multiple emotes in the same message", () => {
  assertEquals(parseEmotes("Kappa Keepo", "25:0-4/1902:6-10"), [
    new TwitchEmote("25", 0, 5, "Kappa"),
    new TwitchEmote("1902", 6, 11, "Keepo"),
  ]);
});

Deno.test("parseEmotes should sort results by start index", () => {
  assertEquals(
    parseEmotes("Kappa Keepo Kappa", "25:0-4,12-16/1902:6-10"),
    [
      new TwitchEmote("25", 0, 5, "Kappa"),
      new TwitchEmote("1902", 6, 11, "Keepo"),
      new TwitchEmote("25", 12, 17, "Kappa"),
    ],
  );
});

Deno.test("parseEmotes should throw a ParseError if emote index range has no dash", () => {
  assertThrowsChain(
    () => parseEmotes("", "25:12"),
    ParseError,
    "No - found in emote index range \"12\"",
  );
});

Deno.test("parseEmotes should accept non-integer emote IDs", () => {
  assertEquals(parseEmotes(":)", "asd:0-1"), [
    new TwitchEmote("asd", 0, 2, ":)"),
  ]);
});

Deno.test("parseEmotes should throw a ParseError if the from index is not a valid integer",
  () => {
    assertThrowsChain(
      () => parseEmotes("", "25:abc-5"),
      ParseError,
      "Invalid integer for string \"abc\"",
    );
  });

Deno.test("parseEmotes should throw a ParseError if the to index is not a valid integer",
  () => {
    assertThrowsChain(
      () => parseEmotes("", "25:0-abc"),
      ParseError,
      "Invalid integer for string \"abc\"",
    );
  });

Deno.test("parseEmotes should throw a ParseError if a end index is out of range", () => {
  assertThrowsChain(
    () => parseEmotes("Kappa", "25:0-5"),
    ParseError,
    "End index 5 is out of range for given message string",
  );
});