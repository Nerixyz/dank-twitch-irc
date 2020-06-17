import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { findAndPushToEnd } from "./find-and-push-to-end.ts";

Deno.test("findAndPushToEnd empty array", () => {
  assertStrictEquals(findAndPushToEnd([], (e) => e === 1), undefined);
});

Deno.test("findAndPushToEnd no filter match", () => {
  assertStrictEquals(findAndPushToEnd([1, 2, 3], (e) => e === 4), undefined);
});

Deno.test("findAndPushToEnd mutated correctly 1", () => {
  const inArr = [1, 2, 3];
  assertStrictEquals(
    findAndPushToEnd(inArr, (e) => e === 1),
    1,
  );

  assertEquals(inArr, [2, 3, 1]);
});

Deno.test("findAndPushToEnd mutated correctly 2", () => {
  const inArr = [1, 2, 3];
  assertStrictEquals(
    findAndPushToEnd(inArr, (e) => e === 2),
    2,
  );

  assertEquals(inArr, [1, 3, 2]);
});
