import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { ignoreErrors } from "./ignore-errors.ts";


Deno.test("ignoreErrors should ignore errors as the first argument and return undefined", () => {
  // @ts-ignore more arguments than expected
  assertStrictEquals(ignoreErrors(new Error("something bad")), undefined);
});
Deno.test("ignoreErrors should return undefined with no arguments", () => {
  assertStrictEquals(ignoreErrors(), undefined);
});
Deno.test("ignoreErrors should make a rejected promise return undefined if used as catch handler",
  async () => {
    const promise = Promise.reject(new Error("something bad"));
    assertStrictEquals(await promise.catch(ignoreErrors), undefined);
  });
Deno.test("ignoreErrors should not alter a resolved promise if used as catch handler",
  async () => {
    const promise = Promise.resolve("something good");
    assertStrictEquals(await promise.catch(ignoreErrors), "something good");
  });
