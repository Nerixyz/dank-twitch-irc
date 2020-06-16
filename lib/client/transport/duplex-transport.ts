import { ExpandedDuplexTransportConfiguration } from "../../config/expanded.ts";
import { DuplexStream, Transport } from "./transport.ts";

export class DuplexTransport implements Transport {
  public readonly duplex: DuplexStream<string>;

  constructor(private readonly config: ExpandedDuplexTransportConfiguration) {
    this.duplex = config.stream();
  }


  public close(): void {}
  public connect(): Promise<void> {
    return Promise.resolve(undefined);
  }

}