import { assertThrowsChain } from "../../helpers.test.ts";
import { parseColor } from "./color.ts";
import { ParseError } from "./parse-error.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";


Deno.test("parseColor should parse numeric color string", () => {
  assertEquals(parseColor("#000000"), {
    r: 0x00,
    g: 0x00,
    b: 0x00,
  });
  assertEquals(parseColor("#123456"), {
    r: 0x12,
    g: 0x34,
    b: 0x56,
  });
  assertEquals(parseColor("#789011"), {
    r: 0x78,
    g: 0x90,
    b: 0x11,
  });
});

Deno.test("parseColor should parse uppercase hex color string", () => {
  assertEquals(parseColor("#AABBCC"), {
    r: 0xaa,
    g: 0xbb,
    b: 0xcc,
  });
  assertEquals(parseColor("#FFFFFF"), {
    r: 0xff,
    g: 0xff,
    b: 0xff,
  });
});

Deno.test("parseColor should parse lowercase hex color string", () => {
  assertEquals(parseColor("#aabbcc"), {
    r: 0xaa,
    g: 0xbb,
    b: 0xcc,
  });
  assertEquals(parseColor("#ffffff"), {
    r: 0xff,
    g: 0xff,
    b: 0xff,
  });
});

Deno.test("parseColor should parse mixed-case hex color string", () => {
  assertEquals(parseColor("#aAbBcC"), {
    r: 0xaa,
    g: 0xbb,
    b: 0xcc,
  });
  assertEquals(parseColor("#FFffFF"), {
    r: 0xff,
    g: 0xff,
    b: 0xff,
  });
});

Deno.test("parseColor should parse alphanumeric hex color string", () => {
  assertEquals(parseColor("#A7F1FF"), {
    r: 0xa7,
    g: 0xf1,
    b: 0xff,
  });
  assertEquals(parseColor("#FF00FF"), {
    r: 0xff,
    g: 0x00,
    b: 0xff,
  });
});

Deno.test("parseColor should throw ParseError on missing leading hash", () => {
  assertThrowsChain(
    () => parseColor("aabbcc"),
    ParseError,
    "Malformed color value \"aabbcc\", must be in format #AABBCC",
  );
});

Deno.test("parseColor should throw ParseError on too-long input string", () => {
  assertThrowsChain(
    () => parseColor("aabbccFF"),
    ParseError,
    "Malformed color value \"aabbccFF\", must be in format #AABBCC",
  );
});

Deno.test("parseColor should throw ParseError on too-short input string", () => {
  assertThrowsChain(
    () => parseColor("aabbc"),
    ParseError,
    "Malformed color value \"aabbc\", must be in format #AABBCC",
  );
});

Deno.test("parseColor should throw ParseError on out-of-range hex characters input string",
  () => {
    assertThrowsChain(
      () => parseColor("AAAEAA"),
      ParseError,
      "Malformed color value \"AAAEAA\", must be in format #AABBCC",
    );
  });