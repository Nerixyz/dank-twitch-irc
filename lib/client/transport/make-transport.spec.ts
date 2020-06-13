import {
  ExpandedWebSocketTransportConfiguration,
} from "../../config/expanded.ts";
import { makeTransport } from "./make-transport.ts";
import { WebSocketTransport } from "./websocket-transport.ts";
import { assert, assertThrows } from "https://deno.land/std/testing/asserts.ts";

Deno.test("#makeTransport", () => {
  const config: ExpandedWebSocketTransportConfiguration = {
    type: "websocket",
    url: "wss://irc-ws.chat.twitch.tv",
    preSetup: false,
  };

  const transport = makeTransport(config);

  assert(transport instanceof WebSocketTransport);

  assertThrows(() => makeTransport({
    // @ts-ignore -- that's the thing we want to test
    type: "invalid"
  }), Error);
});
