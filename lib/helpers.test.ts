import { ChatClient } from "./client/client.ts";
import { SingleConnection } from "./client/connection.ts";
import { assertStrictEquals, assert , assertThrowsAsync, fail, assertEquals, AssertionError} from "https://deno.land/std/testing/asserts.ts";
import { DuplexStream } from "./client/transport/transport.ts";
import { BaseError } from "./utils/base-error.ts";
import { ignoreErrors } from "./utils/ignore-errors.ts";

export function errorOf(p: Promise<any>): Promise<any> {
  return p.catch((e) => e);
}

export async function causeOf(p: Promise<any>): Promise<any> {
  return (await errorOf(p)).cause;
}

function assertLink(e: Error, chain: any[], depth = 0): void {
  const [errorType, message, ...newChain] = chain;

  const actualPrototype = Object.getPrototypeOf(e);
  const expectedPrototype = errorType.prototype;
  assertStrictEquals(
    actualPrototype,
    expectedPrototype,
    `Error at depth ${depth} should be directly instanceof ` +
      `${expectedPrototype}, ` +
      `is instance of: ${actualPrototype}`
  );

  assertStrictEquals(
    e.message,
    message,
    `Error at depth ${depth} should have error message "${message}" but got "${e.message}"`
  );

  // @ts-ignore e.cause is unknown to the compiler
  const cause: Error | undefined = e.cause;
  if (newChain.length > 0) {
    assert("cause" in e, `Error at depth ${depth} should have a cause`);
    assert(cause != null, `Error at depth ${depth} should have a cause`);

    assertLink(cause!, newChain, depth + 1);
  } else {
    assert(
      cause == null,
      `Error at depth ${depth} should not have a cause, ` +
        `but has the following cause: ${cause}`
    );
  }
}

export function assertErrorChain(
  p: Promise<any> | Promise<any>[],
  ...chain: any[]
): Promise<void>;
export function assertErrorChain(e: Error | undefined, ...chain: any[]): void;

export function assertErrorChain(
  e: Promise<any> | Promise<any>[] | Error | undefined,
  ...chain: any[]
): Promise<void> | void {
  if (e instanceof Error || e == null) {
    assert(e != null, "Error must be non-null");
    assertLink(e!, chain);
  } else {
    return (async () => {
      if (!Array.isArray(e)) {
        e = [e];
      }

      for (const eElement of e) {
        await assertThrowsAsync(() => eElement);
        const error: BaseError = await errorOf(eElement);
        assertLink(error, chain);
      }
    })();
  }
}

export function assertThrowsChain(f: () => void, ...chain: any[]): void {
  try {
    f();
  } catch (e) {
    assertErrorChain(e as Error, ...chain);
    return;
  }

  fail("Function did not throw an exception");
}

export interface MockTransportData {
  duplex: DuplexStream<string>,
  data: string[],
  emit: (...lines: string[]) => void,
  end: (error?: Error) => Promise<void>,
  emitAndEnd: (...lines: string[]) => Promise<void>,
}

export function createMockTransport(): MockTransportData {
  const data: string[] = [];

  let readableController: ReadableStreamDefaultController;
  let writableController: WritableStreamDefaultController;
  const readable = new ReadableStream<string>({
    cancel: controller => {
      controller.close();
    },
    start: controller => {
      readableController = controller;
    },
  });
  const writable = new WritableStream<string>({
    close: () => readableController.close(),
    start: controller => {
      writableController = controller;
    },
    write: chunk => {
      data.push(chunk)
    },
  });
  const emit = (...lines: string[]) => readableController.enqueue(lines.map((line) => line + "\r\n").join(""));
  const end = async (error?: Error) => {
    if(error) {
      readableController.error(error);
    }
    else {
      readableController.close();
    }
    await writable.close().catch(ignoreErrors);
  };
  const emitAndEnd = async (...lines: string[]) => {
    emit(...lines);
    await end();
  };
  return {
    duplex: {
      readable,
      writable,
    },
    data,
    emit, end,
    emitAndEnd
  }
}

export type FakeConnectionData = {
  client: SingleConnection;
  clientError: Promise<never>;
} & MockTransportData;

export async function fakeConnection(): Promise<FakeConnectionData> {
  SingleConnection.prototype.onConnect = () => {};

  const transport = createMockTransport();

  const fakeConn = new SingleConnection({
    connection: {
      type: "duplex",
      stream: () => transport.duplex,
      preSetup: true,
    },
  });

  await fakeConn.connect();

  return {
    ...transport,
    client: fakeConn,
    clientError: new Promise<never>((resolve, reject) => {
      fakeConn.once("error", (e) => reject(e));
      fakeConn.once("close", () => resolve());
    }),
  };
}

export type FakeClientData = {
  client: ChatClient;
  clientError: Promise<never>;
  transports: MockTransportData[];
  emit: (...lines: string[]) => void;
  end: () => void;
  emitAndEnd: (...lines: string[]) => void;
};

export function fakeClient(connect = true): FakeClientData {
  const transports: MockTransportData[] = [];

  const getStream = (): DuplexStream<string> => {
    const newTransport = createMockTransport();
    transports.push(newTransport);
    return newTransport.duplex;
  };

  const client = new ChatClient({
    connection: {
      type: "duplex",
      stream: getStream,
      preSetup: true,
    },
    installDefaultMixins: false,
  });

  if (connect) {
    client.connect();
  }

  return {
    emit: (...lines) => transports[0].emit(...lines),
    emitAndEnd: (...lines) => {
      transports[0].emit(...lines);
      queueMicrotask(() => (client.destroy()));
    },
    end: () => {
      client.destroy();
    },
    client,
    clientError: new Promise<never>((resolve, reject) => {
      client.once("error", (e) => reject(e));
      client.once("close", () => resolve());
    }),
    transports,
  };
}

type FakeFn = ((...args: unknown[]) => void) & {
  onceWithArguments(...args: unknown[]): void;
}
export function sinonFake(): FakeFn {
  let callCount = 0;
  let lastArguments: unknown[];
  const fn = (...args: unknown[]) => {
    callCount++;
    lastArguments = args;
  };
  fn.onceWithArguments = (...args: unknown[]) => {
    assertStrictEquals(callCount, 1, 'Should be called once');
    assertEquals(lastArguments, args, 'Should have the same arguments');
  }
  return fn;
}

export async function switchToImmediateTimeout<T>(fn: () => Promise<T>): Promise<T> {
  const base = setTimeout;
  globalThis.setTimeout = fn => base(fn);
  const ret = await fn();
  globalThis.setTimeout = base;
  return ret;
}

export function assertSameMembers(target: unknown[], base: unknown[]) {
  if(!target || !base) throw new AssertionError("Received undefined");
  if(target.length !== base.length) throw new AssertionError("Different length");

  for(const item of base) {
    if(!target.includes(item)) {
      throw new AssertionError("Arrays are different");
    }
  }
}
