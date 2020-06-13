import { reasonForValue } from "../../utils/reason-for-value.ts";
import { MissingDataError } from "./missing-data-error.ts";

export class MissingTagError extends MissingDataError {
  public constructor(
    public tagKey: string,
    public actualValue: string | null | undefined,
    cause?: Error
  ) {
    super(
      `Required tag value not present at key "${tagKey}" (is ${reasonForValue(
        actualValue
      )})`,
      cause
    );
  }
}
