import { ExpandedTransportConfiguration } from "../../config/expanded.ts";
import { TcpTransport } from "./tcp-transport.ts";
//import { DuplexTransport } from "./duplex-transport";
import { Transport } from "./transport.ts";
import { WebSocketTransport } from "./websocket-transport.ts";

export function makeTransport(
  config: ExpandedTransportConfiguration
): Transport {
  switch (config.type) {
    case "tcp":
      return new TcpTransport(config);
    case "websocket":
      return new WebSocketTransport(config);
    default:
      throw new Error("Unknown transport type");
  }
}
