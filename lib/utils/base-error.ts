
export class BaseError extends Error {
  public cause?: Error;

  public constructor(message?: string, cause?: Error) {
    let newMessage;
    if (
      message != null &&
      cause != null &&
      cause.message != null &&
      cause.message.length > 0
    ) {
      newMessage = `${message}: ${cause.message}`;
    } else if (message != null) {
      newMessage = message;
    } else if (cause != null && cause.message != null) {
      newMessage = cause.message;
    } else {
      newMessage = "";
    }
    super(newMessage);
    this.cause = cause;
  }
}
