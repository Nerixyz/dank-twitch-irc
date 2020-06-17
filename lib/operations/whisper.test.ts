import { assertEquals, assert} from "https://deno.land/std/testing/asserts.ts";
import { ClientError, ConnectionError, MessageError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { sendPing } from "./ping.ts";
import { whisper, WhisperError } from "./whisper.ts";

Deno.test("WhisperError should not be instanceof ConnectionError", () => {
  assert(!(
    new WhisperError("pajlada", "test") instanceof
    ConnectionError)
  );
});
Deno.test("WhisperError should not be instanceof ClientError", () => {
  assert(!(new WhisperError("pajlada", "test") instanceof ClientError));
});
Deno.test("whisper should send the correct wire command", async () => {
  const { data, client, clientError } = await fakeConnection();
  clientError.catch(ignoreErrors);

  await switchToImmediateTimeout(() => whisper(client, "pajlada", "hello world").catch(ignoreErrors));

  assertEquals(data, [
    "PRIVMSG #justinfan12345 :/w pajlada hello world\r\n",
  ]);
});

Deno.test("whisper should resolve after 1000 milliseconds", async () => {
  const { client, clientError, end } = await fakeConnection();

  const promise = switchToImmediateTimeout(() => whisper(client, "pajlada", "hello world"));
  await promise;

  await end();
  await clientError;
});

Deno.test("whisper should resolve if outpaced by other command response", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const whisperPromise = whisper(client, "pajlada", "hello world");
  const pingPromise = sendPing(client, "test1234");

  await emitAndEnd(":tmi.twitch.tv PONG tmi.twitch.tv :test1234");

  await whisperPromise;
  await pingPromise;
  await clientError;
});

Deno.test("whisper should be rejected on incoming bad NOTICE", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = whisper(client, "pajlada", "hello world");

  await emitAndEnd(
    "@msg-id=whisper_limit_per_sec :tmi.twitch.tv NOTICE #justinfan12345 " +
    ":You are sending whispers too fast. Try again in a second.",
  );

  await assertErrorChain(
    promise,
    WhisperError,
    "Failed to whisper [pajlada]: hello world: Bad response message:" +
    " @msg-id=whisper_limit_per_sec :tmi.twitch.tv NOTICE #justinfa" +
    "n12345 :You are sending whispers too fast. Try again in a second.",
    MessageError,
    "Bad response message: @msg-id=whisper_limit_per_sec" +
    " :tmi.twitch.tv NOTICE #justinfan12345 :You are " +
    "sending whispers too fast. Try again in a second.",
  );

  await assertErrorChain(
    clientError,
    WhisperError,
    "Failed to whisper [pajlada]: hello world: Bad response message:" +
    " @msg-id=whisper_limit_per_sec :tmi.twitch.tv NOTICE #justinfa" +
    "n12345 :You are sending whispers too fast. Try again in a second.",
    MessageError,
    "Bad response message: @msg-id=whisper_limit_per_sec" +
    " :tmi.twitch.tv NOTICE #justinfan12345 :You are " +
    "sending whispers too fast. Try again in a second.",
  );
});
