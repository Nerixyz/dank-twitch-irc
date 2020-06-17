import { assertThrowsChain } from "../../helpers.test.ts";
import { TwitchBadge } from "../badge.ts";
import { TwitchBadgesList } from "../badges.ts";
import { parseBadges, parseSingleBadge } from "./badges.ts";
import { ParseError } from "./parse-error.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("parseSingleBadge should parse correct badge normally", () => {
  assertEquals(
    parseSingleBadge("subscriber/24"),
    new TwitchBadge("subscriber", "24"),
  );
  assertEquals(
    parseSingleBadge("subscriber/12"),
    new TwitchBadge("subscriber", "12"),
  );
  assertEquals(
    parseSingleBadge("vip/1"),
    new TwitchBadge("vip", "1"),
  );
});

Deno.test("parseSingleBadge should preserve non-integer versions as-is", () => {
  assertEquals(
    parseSingleBadge("vip/1.0"),
    new TwitchBadge("vip", "1.0"),
  );
  assertEquals(
    parseSingleBadge("vip/1.0000"),
    new TwitchBadge("vip", "1.0000"),
  );
  assertEquals(
    parseSingleBadge("vip/01"),
    new TwitchBadge("vip", "01"),
  );
  assertEquals(
    parseSingleBadge("vip/00001"),
    new TwitchBadge("vip", "00001"),
  );
  assertEquals(
    parseSingleBadge("vip/special"),
    new TwitchBadge("vip", "special"),
  );
});

Deno.test("parseSingleBadge should throw ParseError if no / is present", () => {
  assertThrowsChain(
    () => parseSingleBadge("subscriber12"),
    ParseError,
    "Badge source \"subscriber12\" did not contain '/' character",
  );
  assertThrowsChain(
    () => parseSingleBadge(""),
    ParseError,
    "Badge source \"\" did not contain '/' character",
  );
  assertThrowsChain(
    () => parseSingleBadge("test"),
    ParseError,
    "Badge source \"test\" did not contain '/' character",
  );
});

Deno.test("parseSingleBadge should throw ParseError if badge name is empty", () => {
  assertThrowsChain(
    () => parseSingleBadge("/5"),
    ParseError,
    "Empty badge name on badge \"/5\"",
  );
  assertThrowsChain(
    () => parseSingleBadge("/"),
    ParseError,
    "Empty badge name on badge \"/\"",
  );
});

Deno.test("parseSingleBadge should throw ParseError if badge version is empty", () => {
  assertThrowsChain(
    () => parseSingleBadge("subscriber/"),
    ParseError,
    "Empty badge version on badge \"subscriber/\"",
  );
});

Deno.test("parseBadges should parse empty string as empty list", () => {
  assertEquals(parseBadges(""), new TwitchBadgesList());
});

Deno.test("parseBadges should parse badges tag with 1 badge correctly", () => {
  const expected = new TwitchBadgesList();
  expected.push(new TwitchBadge("subscriber", "1"));

  assertEquals(parseBadges("subscriber/1"), expected);
});

Deno.test("parseBadges should parse badges tag with 2 badges correctly", () => {
  const expected = new TwitchBadgesList();
  expected.push(new TwitchBadge("subscriber", "12"));
  expected.push(new TwitchBadge("vip", "1"));

  assertEquals(parseBadges("subscriber/12,vip/1"), expected);
});

Deno.test("parseBadges should parse badges tag with 3 badges correctly", () => {
  const expected = new TwitchBadgesList();
  expected.push(new TwitchBadge("subscriber", "12"));
  expected.push(new TwitchBadge("vip", "1"));
  expected.push(new TwitchBadge("staff", "1"));

  assertEquals(
    parseBadges("subscriber/12,vip/1,staff/1"),
    expected,
  );
});
