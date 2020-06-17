import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { anyCauseInstanceof, causeOf } from "./any-cause-instanceof.ts";
import { BaseError } from "./base-error.ts";
import { assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("causeOf returns undefined on Error", () => {
  assertStrictEquals(causeOf(new Error()), undefined);
});

Deno.test("causeOf returns the cause on BaseErrors", () => {
  // given
  const cause = new Error("cause");
  const error = new BaseError("error", cause);

  // when
  const gottenCause = causeOf(error);

  // then
  assertStrictEquals(gottenCause, cause);
});

Deno.test("causeOf ignores #cause property on non-BaseErrors", () => {
  // given
  const error = new Error("error");
  // @ts-ignore
  error.cause = "cause string";

  // when
  const gottenCause = causeOf(error);

  // then
  assertStrictEquals(gottenCause, undefined);
});

class TestErrorA extends BaseError {}

class TestErrorB extends BaseError {}

class TestErrorC extends BaseError {}

Deno.test("anyCauseInstanceof returns false on undefined input", () => {
  assertFalse(anyCauseInstanceof(undefined, Error));
  assertFalse(anyCauseInstanceof(undefined, TestErrorA));
});

Deno.test("anyCauseInstanceof works on errors without a cause field", () => {
  const error = Error("E");

  assertTrue(anyCauseInstanceof(error, Error));
  assertFalse(anyCauseInstanceof(error, TestErrorA));
  assertFalse(anyCauseInstanceof(error, TestErrorB));
  assertFalse(anyCauseInstanceof(error, TestErrorC));
});

Deno.test("anyCauseInstanceof level 0", () => {
  const errorA = new TestErrorA("A");

  // validate that the function finds the error at level 0 (top-level/the error that was passed)
  assertTrue(anyCauseInstanceof(errorA, Error));
  assertTrue(anyCauseInstanceof(errorA, TestErrorA));
  assertFalse(anyCauseInstanceof(errorA, TestErrorB));
  assertFalse(anyCauseInstanceof(errorA, TestErrorC));
});

Deno.test("anyCauseInstanceof level 1", () => {
  const errorA = new TestErrorA("A");
  const errorB = new TestErrorB("B", errorA);

  // validate that the function finds the error at level 1
  assertTrue(anyCauseInstanceof(errorB, Error));
  assertTrue(anyCauseInstanceof(errorB, TestErrorA));
  assertTrue(anyCauseInstanceof(errorB, TestErrorB));
  assertFalse(anyCauseInstanceof(errorB, TestErrorC));
});

Deno.test("anyCauseInstanceof level 2", () => {
  const errorA = new TestErrorA("A");
  const errorB = new TestErrorB("B", errorA);
  const errorC = new TestErrorC("C", errorB);

  // validate that the function finds the error at level 2
  assertTrue(anyCauseInstanceof(errorC, Error));
  assertTrue(anyCauseInstanceof(errorC, BaseError));
  assertTrue(anyCauseInstanceof(errorC, TestErrorA));
  assertTrue(anyCauseInstanceof(errorC, TestErrorB));
  assertTrue(anyCauseInstanceof(errorC, TestErrorC));
});
