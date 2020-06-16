import { ExpandedTransportConfiguration } from "../../config/expanded.ts";
import { DuplexTransport } from "./duplex-transport.ts";
import { TcpTransport } from "./tcp-transport.ts";
import { Transport } from "./transport.ts";
import { WebSocketTransport } from "./websocket-transport.ts";

export function makeTransport(
  config: ExpandedTransportConfiguration
): Transport {
  switch (config.type) {
    case "duplex":
      return new DuplexTransport(config);
    case "tcp":
      return new TcpTransport(config);
    case "websocket":
      return new WebSocketTransport(config);
    default:
      throw new Error("Unknown transport type");
  }
}
