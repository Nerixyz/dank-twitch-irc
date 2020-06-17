import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseEmoteSets } from "./emote-sets.ts";


Deno.test("parseEmoteSets should parse empty string as empty list", () => {
  assertEquals(parseEmoteSets(""), []);
});

Deno.test("parseEmoteSets should parse single digit as single element array", () => {
  assertEquals(parseEmoteSets("0"), ["0"]);
  assertEquals(parseEmoteSets("100"), ["100"]);
});

Deno.test("parseEmoteSets should ignore empty emote set IDs (two adjacent commas)", () => {
  assertEquals(parseEmoteSets("0,,,100,200,,33,4"), [
    "0",
    "100",
    "200",
    "33",
    "4",
  ]);
});

Deno.test("parseEmoteSets should parse multiple emote sets correctly", () => {
  assertEquals(parseEmoteSets("0,100,200,33,4"), [
    "0",
    "100",
    "200",
    "33",
    "4",
  ]);
});

Deno.test("parseEmoteSets should be able to accept non-number emote set IDs", () => {
  // it is doubtful twitch ever does this, but nowhere does it say
  // emote set IDs have to be numeric, so just make sure we're safe.
  assertEquals(parseEmoteSets("0,1,2-extra,something-else"), [
    "0",
    "1",
    "2-extra",
    "something-else",
  ]);
});