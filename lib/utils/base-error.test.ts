import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { BaseError } from "./base-error.ts";

Deno.test("BaseError should preserve the passed cause", () => {
  const cause = new Error("cause msg");
  const error = new BaseError("error msg", cause);

  assertStrictEquals(error.cause, cause);
  assertStrictEquals(new BaseError("error msg").cause, undefined);
});

Deno.test(
  "BaseError should set resulting message to ownMessage: causeMessage if both are non-undefined",
  () => {
    const cause = new Error("cause msg");
    const error = new BaseError("error msg", cause);

    assertStrictEquals(error.message, "error msg: cause msg");
  });

Deno.test("BaseError should set resulting message to causeMessage if only causeMessage is present",
  () => {
    const cause = new Error("cause msg");
    const error = new BaseError(undefined, cause);

    assertStrictEquals(error.message, "cause msg");
  });

Deno.test(
  "BaseError should set resulting message to ownMessage if only ownMessage is present (case 1 where cause is present but cause has no message)",
  () => {
    const cause = new Error();
    const error = new BaseError("error msg", cause);

    assertStrictEquals(error.message, "error msg");
  },
);

Deno.test(
  "BaseError should set resulting message to ownMessage if only ownMessage is present (case 2 where cause is not present)",
  () => {
    const error = new BaseError("error msg");

    assertStrictEquals(error.message, "error msg");
  },
);

Deno.test(
  "BaseError should set resulting message to empty string if " +
  "cause has no message",
  () => {
    const cause = new Error();
    const error = new BaseError(undefined, cause);

    assertStrictEquals(error.message, "");
  },
);

Deno.test(
  "BaseError should set resulting message to empty string if there is no cause and no message",
  () => {
    const error = new BaseError();

    assertStrictEquals(error.message, "");
  });
