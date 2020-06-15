import {WebSocket, connectWebSocket} from "https://deno.land/std/ws/mod.ts";
import { ExpandedWebSocketTransportConfiguration } from "../../config/expanded.ts";
import { ignoreErrors } from "../../utils/ignore-errors.ts";
import { Transport } from "./transport.ts";

export class WebSocketTransport implements Transport {
  public readable: ReadableStream<string>;

  private duplex: TransformStream<string, string>;

  private readonly config: ExpandedWebSocketTransportConfiguration;
  private wsStream?: WebSocket;

  public constructor(config: ExpandedWebSocketTransportConfiguration) {
    this.config = config;
    this.duplex = new TransformStream();
    this.readable = this.duplex.readable;
  }
  close(): void {
    if(this.wsStream && !this.wsStream.isClosed) {
      this.wsStream.close();
    }
  }

  public async connect(connectionListener?: () => void): Promise<void> {
    this.wsStream = await connectWebSocket(this.config.url);

    asyncIteratorToReadable(this.wsStream).pipeTo(this.duplex.writable);
    connectionListener?.();
  }

  public write(chunk: string) {
    this.wsStream!.send(chunk);
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
            console.log(result.value);
          }
        })
        .catch(e => controller.error(e));
    }
  });
}