import { isAnonymousUsername } from "./is-anonymous-username.ts";
import { assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";


Deno.test("isAnonymousUsername should be true for valid justinfan usernames", () => {
  assertTrue(isAnonymousUsername("justinfan12345"));
  assertTrue(isAnonymousUsername("justinfan1"));
  assertTrue(isAnonymousUsername("justinfan99"));
  assertTrue(isAnonymousUsername("justinfan999"));
  assertTrue(isAnonymousUsername("justinfan9999"));
  assertTrue(isAnonymousUsername("justinfan99999"));
  assertTrue(isAnonymousUsername("justinfan999999"));
  assertTrue(isAnonymousUsername("justinfan9999999"));
  assertTrue(isAnonymousUsername("justinfan99999999"));
});

Deno.test("isAnonymousUsername should be false if username only matches partially", () => {
  assertFalse(isAnonymousUsername("some_justinfan12345"));
  assertFalse(isAnonymousUsername("justinfan12345kappa"));
  assertFalse(isAnonymousUsername("some_justinfan12345kappa"));
});

Deno.test("isAnonymousUsername should be false if justinfan is capitalized incorrectly",
  () => {
    assertFalse(isAnonymousUsername("Justinfan12345"));
  });
