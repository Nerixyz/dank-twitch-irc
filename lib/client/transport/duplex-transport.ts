import { ExpandedDuplexTransportConfiguration } from "../../config/expanded.ts";
import { ignoreErrors } from "../../utils/ignore-errors.ts";
import { DuplexStream, Transport } from "./transport.ts";

export class DuplexTransport implements Transport {
  public readonly duplex: DuplexStream<string>;

  constructor(private readonly config: ExpandedDuplexTransportConfiguration) {
    this.duplex = config.stream();
  }


  public close(): void {
    this.duplex.writable.close().catch(ignoreErrors);
  }
  public connect(): Promise<void> {
    return Promise.resolve(undefined);
  }

}