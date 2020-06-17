import { ExpandedDuplexTransportConfiguration } from "../../config/expanded.ts";
import { DuplexTransport } from "./duplex-transport.ts";
import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("DuplexTransport should call the stream-getter function from the config once", () => {
  const stream = new TransformStream();

  let callCount = 0;
  const streamGetter = () => (++callCount, stream);
  const config: ExpandedDuplexTransportConfiguration = {
    type: "duplex",
    stream: streamGetter,
    preSetup: false,
  };

  const transport = new DuplexTransport(config);

  assertStrictEquals(callCount, 1);
  assertStrictEquals(transport.duplex, stream);
});