import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertThrowsChain } from "../../helpers.test.ts";
import { parseIntThrowing } from "./common.ts";
import { ParseError } from "./parse-error.ts";


Deno.test("parseIntThrowing should fail on undefined", () => {
  assertThrowsChain(
    () => parseIntThrowing(undefined),
    ParseError,
    "String source for integer is null/undefined",
  );
});
Deno.test("parseIntThrowing should fail on null", () => {
  assertThrowsChain(
    () => parseIntThrowing(null),
    ParseError,
    "String source for integer is null/undefined",
  );
});
Deno.test("parseIntThrowing should fail on non-number string input", () => {
  assertThrowsChain(
    () => parseIntThrowing("xd"),
    ParseError,
    "Invalid integer for string \"xd\"",
  );
});
Deno.test("parseIntThrowing should parse integers normally", () => {
  assertStrictEquals(parseIntThrowing("0"), 0);
  assertStrictEquals(parseIntThrowing("1"), 1);
  assertStrictEquals(parseIntThrowing("1.0"), 1);
  assertStrictEquals(parseIntThrowing("1.000"), 1);
  assertStrictEquals(parseIntThrowing("01.00"), 1);
  assertStrictEquals(parseIntThrowing("01"), 1);
  assertStrictEquals(parseIntThrowing("1.1"), 1);
  assertStrictEquals(parseIntThrowing("1.5"), 1);
  assertStrictEquals(parseIntThrowing("1.9999999999"), 1);
  assertStrictEquals(
    parseIntThrowing("9007199254740991"),
    Number.MAX_SAFE_INTEGER,
  );
  assertStrictEquals(parseIntThrowing("-1"), -1);
  assertStrictEquals(
    parseIntThrowing("-9007199254740991"),
    Number.MIN_SAFE_INTEGER,
  );
});
