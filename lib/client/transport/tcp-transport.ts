import { ExpandedTcpTransportConfiguration } from "../../config/expanded.ts";
import { Transport } from "./transport.ts";
import { encode, decode } from "https://deno.land/std/encoding/utf8.ts";

export class TcpTransport implements Transport {
  private readonly outTransformer = new TransformStream<string, string>();
  private readonly inTransformer = new TransformStream<string, string>();
  public readonly duplex = {
    readable: this.inTransformer.readable,
    writable: this.outTransformer.writable,
  };

  private conn?: Deno.Conn;

  constructor(private readonly config: ExpandedTcpTransportConfiguration) {}

  public close(): void {
    this.conn?.close();
  }
  public async connect(): Promise<void> {
    this.conn = await (this.config.secure ? Deno.connectTls({
      hostname: this.config.host,
      port: this.config.port,
    }) : Deno.connect({
      hostname: this.config.host,
      port: this.config.port,
    }));

    //noinspection ES6MissingAwait
    readerToReadableStream(this.conn, this.config.bufferSize).pipeTo(this.inTransformer.writable);

    //noinspection ES6MissingAwait
    this.outTransformer.readable.pipeTo(new WritableStream({
      write: (chunk, controller) => {
        if (this.conn) {
          this.conn.write(encode(chunk));
        } else {
          controller.error(new Error(
            "There's no open Websocket"));
        }
      },
    }));
  }

}

function readerToReadableStream(target: Deno.Reader, bufferLength = 1024): ReadableStream<string> {
  const buffer = new Uint8Array(bufferLength);
  return new ReadableStream({
    pull(controller: ReadableStreamDefaultController) {
      target.read(buffer)
        .then((nBytes: number | null) => nBytes &&
          controller.enqueue(decode(buffer.slice(0, nBytes))))
        .catch((e: unknown) => controller.error(e));
    },
  });
}