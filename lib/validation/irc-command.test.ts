import { assertThrowsChain } from "../helpers.test.ts";
import { validateIRCCommand } from "./irc-command.ts";
import { ValidationError } from "./validation-error.ts";


Deno.test("validateIRCCommand should reject newlines", function() {
  assertThrowsChain(
    () => validateIRCCommand("JOIN\n"),
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
  assertThrowsChain(
    () => validateIRCCommand("\n"),
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
  assertThrowsChain(
    () => validateIRCCommand("\nJOIN"),
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
  assertThrowsChain(
    () => validateIRCCommand("JOIN\nJOIN"),
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
});

Deno.test("validateIRCCommand should reject carriage returns", function() {
  assertThrowsChain(
    () => validateIRCCommand("JOIN\r"),
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
  assertThrowsChain(
    () => validateIRCCommand("\r"),
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
  assertThrowsChain(
    () => validateIRCCommand("\rJOIN"),
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
  assertThrowsChain(
    () => validateIRCCommand("JOIN\rJOIN"),
    ValidationError,
    "IRC command may not include \\n or \\r",
  );
});

Deno.test("validateIRCCommand should pass normal IRC commands", function() {
  validateIRCCommand("JOIN");
  validateIRCCommand("");
  validateIRCCommand("PRIVMSG #forsen :asd");
  validateIRCCommand("JOIN #pajlada");
});
