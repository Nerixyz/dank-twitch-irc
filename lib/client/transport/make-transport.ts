import { ExpandedTransportConfiguration } from "../../config/expanded.ts";
//import { DuplexTransport } from "./duplex-transport";
import { Transport } from "./transport.ts";
import { WebSocketTransport } from "./websocket-transport.ts";

export function makeTransport(
  config: ExpandedTransportConfiguration
): Transport {
  switch (config.type) {
    case "websocket":
      return new WebSocketTransport(config);
    default:
      throw new Error("Unknown transport type");
  }
}
