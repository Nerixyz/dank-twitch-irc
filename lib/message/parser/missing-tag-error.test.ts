import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { MissingTagError } from "./missing-tag-error.ts";

Deno.test("MissingTagError should have a special formatted message on undefined", () => {
  const e = new MissingTagError("exampleKey", undefined);
  assertStrictEquals(
    e.message,
    "Required tag value not present at key \"exampleKey\" (is undefined)",
  );
});

Deno.test("MissingTagError should have a special formatted message on null", () => {
  const e = new MissingTagError("exampleKey", null);
  assertStrictEquals(
    e.message,
    "Required tag value not present at key \"exampleKey\" (is null)",
  );
});

Deno.test("MissingTagError should have a special formatted message on empty string", () => {
  const e = new MissingTagError("exampleKey", "");
  assertStrictEquals(
    e.message,
    "Required tag value not present at key \"exampleKey\" (is empty string)",
  );
});

Deno.test("MissingTagError should have a formatted message on other string values", () => {
  const e = new MissingTagError("exampleKey", "test");
  assertStrictEquals(
    e.message,
    "Required tag value not present at key \"exampleKey\" (is \"test\")",
  );
});

Deno.test("MissingTagError should store the given values as instance properties", () => {
  const e = new MissingTagError("exampleKey", "testValue");
  assertStrictEquals(e.tagKey, "exampleKey");
  assertStrictEquals(e.actualValue, "testValue");
});
