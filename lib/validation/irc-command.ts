import { ValidationError } from "./validation-error.ts";

export function validateIRCCommand(command: string): void {
  if (command.includes("\n") || command.includes("\r")) {
    throw new ValidationError("IRC command may not include \\n or \\r");
  }
}
