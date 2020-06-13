import {WebSocket, connectWebSocket} from "https://deno.land/std/ws/mod.ts";
import { ExpandedWebSocketTransportConfiguration } from "../../config/expanded.ts";
import { ignoreErrors } from "../../utils/ignore-errors.ts";
import { Transport } from "./transport.ts";

export class WebSocketTransport implements Transport {
  //@ts-ignore
  public readable;

  private readonly config: ExpandedWebSocketTransportConfiguration;
  private wsStream?: WebSocket;

  public constructor(config: ExpandedWebSocketTransportConfiguration) {
    this.config = config;
  }
  close(): void {
    if(this.wsStream && !this.wsStream.isClosed) {
      this.wsStream.close();
      this.readable.cancel();
    }
  }

  public async connect(connectionListener?: () => void): Promise<void> {
    this.wsStream = await connectWebSocket(this.config.url);
    this.readable = asyncIteratorToReadable(this.wsStream);
    connectionListener?.();
  }

  public write(chunk: string) {
    this.wsStream!.send(chunk);
  }
}
export function asyncIteratorToReadable<T>(iterable: AsyncIterable<T>): ReadableStream<T> {
  const iterator = iterable[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller: ReadableStreamDefaultController) {
      iterator.next()
        .then(result => result.done ? controller.close() : (controller.enqueue(result.value)))
        .catch(e => controller.error(e));
    }
  });
}