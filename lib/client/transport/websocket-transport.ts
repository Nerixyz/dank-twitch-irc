import {WebSocket, connectWebSocket} from "https://deno.land/std/ws/mod.ts";
import { ExpandedWebSocketTransportConfiguration } from "../../config/expanded.ts";
import { DuplexStream, Transport } from "./transport.ts";

export class WebSocketTransport implements Transport {
  public duplex: DuplexStream<string>;
  private readonly outTransformer: TransformStream<string, string>;
  private readonly inTransformer: TransformStream<string, string>;

  private wsStream?: WebSocket;

  public constructor(private readonly config: ExpandedWebSocketTransportConfiguration) {
    this.outTransformer = new TransformStream(undefined, new CountQueuingStrategy({highWaterMark: 5}));
    this.inTransformer = new TransformStream();
    this.duplex = {
      readable: this.inTransformer.readable,
      writable: this.outTransformer.writable,
    };
  }
  close(): void {
    if(this.wsStream && !this.wsStream.isClosed) {
      this.wsStream.close();
    }
  }

  public async connect(): Promise<void> {
    this.wsStream = await connectWebSocket(this.config.url);

    //noinspection ES6MissingAwait
    asyncIteratorToReadable(this.wsStream).pipeTo(this.inTransformer.writable);
    //noinspection ES6MissingAwait -- This resolves once the piping is complete; so never
    this.outTransformer.readable.pipeTo(new WritableStream({
      write: (chunk, controller) => {
        if(this.wsStream) {
          this.wsStream.send(chunk).catch(e => controller.error(e));
        } else {
          controller.error(new Error("There's no open Websocket"));
        }
      }
    }));
  }
}

export function asyncIteratorToReadable(iterable: AsyncIterable<string | object>): ReadableStream<string> {
  const iterator = iterable[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller: ReadableStreamDefaultController) {
      iterator.next()
        .then(result => {
          if(result.done) {
            return controller.close();
          } else if(typeof result.value === "string") {
            return controller.enqueue(result.value);
          } else {
            // ignore i guess ...?
          }
        })
        .catch(e => controller.error(e));
    }
  });
}