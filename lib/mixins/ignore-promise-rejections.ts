import { ChatClient } from "../client/client.ts";
import { applyReplacements } from "../utils/apply-function-replacements.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { ClientMixin } from "./base-mixin.ts";

export class IgnoreUnhandledPromiseRejectionsMixin implements ClientMixin {
  public applyToClient(client: ChatClient): void {
    const genericReplacement = <V, A extends any[]>(
      originalFn: (...args: A) => Promise<V>,
      ...args: A
    ): Promise<V | undefined> => {
      const originalPromise = originalFn(...args);
      originalPromise.catch(ignoreErrors);
      return originalPromise;
    };

    applyReplacements(this, client, {
      join: genericReplacement,
      part: genericReplacement,
      privmsg: genericReplacement,
      say: genericReplacement,
      me: genericReplacement,
      whisper: genericReplacement,
      ping: genericReplacement,
    });
  }
}
