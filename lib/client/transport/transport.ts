
/**
 *  A small diagram 📝
 *
 *                        ->-[inTransform]->-
 *                      /                    \
 *            -->--[in.writable]        [in.readable]->
 *          /                                          \
 *      [Socket]                                     [Connection]
 *          \                                          /
 *           --<--[out.readable]      [out.writable]<--
 *                     \                /
 *                      -<-[outTransform]
 */

export interface Transport {
  readonly duplex: DuplexStream<string>;
  connect(): Promise<void>;
  close(): void;
}

export interface DuplexStream<T> {
  readable: ReadableStream<T>;
  writable: WritableStream<T>;
}
