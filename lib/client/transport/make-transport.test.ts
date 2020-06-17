import {
  ExpandedDuplexTransportConfiguration,
  ExpandedTcpTransportConfiguration,
  ExpandedWebSocketTransportConfiguration,
} from "../../config/expanded.ts";
import { DuplexTransport } from "./duplex-transport.ts";
import { makeTransport } from "./make-transport.ts";
import { TcpTransport } from "./tcp-transport.ts";
import { WebSocketTransport } from "./websocket-transport.ts";
import { assertThrows } from "https://deno.land/std/testing/asserts.ts";
import {assertInstanceOf} from "https://deno.land/x/explicitly/mod.ts";

Deno.test("makeTransport should make a TcpTransport for tcp configurations", () => {
  const config: ExpandedTcpTransportConfiguration = {
    type: "tcp",
    secure: true,
    host: "irc.chat.twitch.tv",
    port: 6697,
    preSetup: false,
    bufferSize: 2048
  };

  const transport = makeTransport(config);

  assertInstanceOf(transport, TcpTransport);
});

Deno.test("makeTransport should make a DuplexTransport for duplex configurations", () => {
  const config: ExpandedDuplexTransportConfiguration = {
    type: "duplex",
    stream: () => new TransformStream(),
    preSetup: false,
  };

  const transport = makeTransport(config);

  assertInstanceOf(transport, DuplexTransport);
});

Deno.test("makeTransport should make a WebSocketTransport for websocket configurations", () => {
  const config: ExpandedWebSocketTransportConfiguration = {
    type: "websocket",
    url: "wss://irc-ws.chat.twitch.tv",
    preSetup: false,
  };

  const transport = makeTransport(config);

  assertInstanceOf(transport, WebSocketTransport);
});

Deno.test("makeTransport should throw an error on unknown transport type", () => {
  // @ts-ignore override typescript correcting us
  assertThrows(() => makeTransport({ type: "invalid" }), Error);
});
