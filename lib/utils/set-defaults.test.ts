import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { setDefaults } from "./set-defaults.ts";

Deno.test("setDefaults assigns to empty object", () => {
  assertEquals(setDefaults({}, { a: 1, b: 2 }), { a: 1, b: 2 });
});

Deno.test("setDefaults does not override inputs", () => {
  assertEquals(setDefaults({ a: 3 }, { a: 1, b: 2 }), {
    a: 3,
    b: 2,
  });
});

Deno.test("setDefaults accepts undefined inputs", () => {
  assertEquals(setDefaults(undefined, { a: 1, b: 2 }), {
    a: 1,
    b: 2,
  });
});

Deno.test("setDefaults keeps extra input properties", () => {
  // @ts-ignore TS compiler forbids the "c" key but since this is JS and the
  // compiler is no guarantee i want to test for this case too.
  assertEquals(setDefaults({ c: 3 }, { a: 1, b: 2 }), {
    a: 1,
    b: 2,
    c: 3,
  });
});
