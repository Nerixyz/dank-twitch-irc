import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { removeInPlace } from "./remove-in-place.ts";


Deno.test("removeInPlace empty array", () => {
  const arr: number[] = [];
  removeInPlace(arr, 1);
  assertEquals(arr, []);
});

Deno.test("removeInPlace correct on one", () => {
  const arr = [1, 2, 3];
  removeInPlace(arr, 2);
  assertEquals(arr, [1, 3]);
});

Deno.test("removeInPlace correct on multiple", () => {
  const arr = [1, 2, 3, 2];
  removeInPlace(arr, 2);
  assertEquals(arr, [1, 3]);
});

Deno.test("removeInPlace at the start", () => {
  const arr = [1, 2, 3];
  removeInPlace(arr, 1);
  assertEquals(arr, [2, 3]);
});

Deno.test("removeInPlace at the end", () => {
  const arr = [1, 2, 3];
  removeInPlace(arr, 2);
  assertEquals(arr, [1, 3]);
});
