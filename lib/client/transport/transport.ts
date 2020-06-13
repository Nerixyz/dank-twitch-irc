export interface Transport {
  readonly readable: ReadableStream<string>;
  connect(connectionListener?: () => void): void;
  write(chunk: string): void;
  close(): void;
}
