import { assertThrowsChain } from "../../helpers.test.ts";
import { parseIRCMessage } from "../parser/irc-message.ts";
import { MissingDataError } from "../parser/missing-data-error.ts";
import { requireNickname, requireParameter } from "./irc-message.ts";
import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";


Deno.test("requireParameter should throw MissingDataError if parameters have length 0", () => {
  assertThrowsChain(
    () => requireParameter({ ircParameters: [] }, 0),
    MissingDataError,
    "Parameter at index 0 missing",
  );
  assertThrowsChain(
    () => requireParameter({ ircParameters: [] }, 1),
    MissingDataError,
    "Parameter at index 1 missing",
  );
  assertThrowsChain(
    () => requireParameter({ ircParameters: [] }, 2),
    MissingDataError,
    "Parameter at index 2 missing",
  );
});

Deno.test("requireParameter should be able to return parameter 0 if parameters have length 1",
  () => {
    assertStrictEquals(
      "test parameter",
      requireParameter({ ircParameters: ["test parameter"] }, 0),
    );
    assertThrowsChain(
      () => requireParameter({ ircParameters: ["test parameter"] }, 1),
      MissingDataError,
      "Parameter at index 1 missing",
    );
    assertThrowsChain(
      () => requireParameter({ ircParameters: ["test parameter"] }, 2),
      MissingDataError,
      "Parameter at index 2 missing",
    );
  });

Deno.test("requireParameter should be able to return parameter 0 and 1 if parameters have length 2",
  () => {
    assertStrictEquals(
      "test",
      requireParameter({ ircParameters: ["test", "parameters"] }, 0),
    );
    assertStrictEquals(
      "parameters",
      requireParameter({ ircParameters: ["test", "parameters"] }, 1),
    );
    assertThrowsChain(
      () => requireParameter({ ircParameters: ["test", "parameters"] }, 2),
      MissingDataError,
      "Parameter at index 2 missing",
    );
  });

Deno.test("getNickname should throw MissingDataError if nickname or prefix is missing", () => {
  assertThrowsChain(
    () => requireNickname(parseIRCMessage("JOIN #pajlada")),
    MissingDataError,
    "Missing prefix or missing nickname in prefix",
  );

  assertThrowsChain(
    () => requireNickname(parseIRCMessage(":tmi.twitch.tv JOIN #pajlada")),
    MissingDataError,
    "Missing prefix or missing nickname in prefix",
  );
});

Deno.test("getNickname should return the nickname otherwise", () => {
  const message = parseIRCMessage(
    ":leppunen!LEPPUNEN@lePPunen.tmi.twitch.tv JOIN #pajlada",
  );
  assertStrictEquals(requireNickname(message), "leppunen");
});
