import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { reasonForValue } from "./reason-for-value.ts";


Deno.test("reasonForValue should return \"undefined\" for undefined", () => {
  assertStrictEquals(reasonForValue(undefined), "undefined");
});
Deno.test("reasonForValue should return \"null\" for null", () => {
  assertStrictEquals(reasonForValue(null), "null");
});
Deno.test("reasonForValue should return \"empty string\" for an empty string", () => {
  assertStrictEquals(reasonForValue(""), "empty string");
});
Deno.test("reasonForValue should return \"\"the string value\"\" for string values", () => {
  assertStrictEquals(reasonForValue("test"), "\"test\"");
});
