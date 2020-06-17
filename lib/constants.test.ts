import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import {
  MAX_OUTGOING_COMMAND_LENGTH,
  MAX_OUTGOING_LINE_LENGTH,
} from "./constants.ts";

Deno.test("MAX_OUTGOING_LINE_LENGTH should be 4096", function() {
  assertStrictEquals(MAX_OUTGOING_LINE_LENGTH, 4096);
});

Deno.test("MAX_OUTGOING_LINE_LENGTHshould be 4094", function() {
  assertStrictEquals(MAX_OUTGOING_COMMAND_LENGTH, 4094);
});
