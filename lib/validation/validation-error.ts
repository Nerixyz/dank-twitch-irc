import { BaseError } from "../utils/base-error.ts";

export class ValidationError extends BaseError {
  public constructor(message: string) {
    super(message);
  }
}
