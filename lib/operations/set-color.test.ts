import {assert, assertEquals} from "https://deno.land/std/testing/asserts.ts";
import { TimeoutError } from "../await/timeout-error.ts";
import { ClientError, ConnectionError, MessageError } from "../client/errors.ts";
import { assertErrorChain, fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { setColor, SetColorError } from "./set-color.ts";


Deno.test("SetColorError should not be instanceof ConnectionError", () => {
  assert(!(
    new SetColorError({ r: 255, g: 0, b: 0 }) instanceof
    ConnectionError)
  );
});
Deno.test("SetColorError should not be instanceof ClientError", () => {
  assert(!(
    new SetColorError({ r: 255, g: 0, b: 0 }) instanceof
    ClientError)
  );
});

Deno.test("setColor should send the correct wire command", async () => {
  const { data, client, clientError } = await fakeConnection();
  clientError.catch(ignoreErrors);

  await switchToImmediateTimeout(() => setColor(client, { r: 255, g: 0, b: 1 }).catch(ignoreErrors));

  assertEquals(data, [
    "PRIVMSG #justinfan12345 :/color #ff0001\r\n",
  ]);
});

Deno.test("setColor should fail after 2000 milliseconds of no response", async () => {
  const { client, clientError } = await fakeConnection();

  const promise = switchToImmediateTimeout(() => setColor(client, { r: 255, g: 0, b: 1 }));


  await assertErrorChain(
    promise,
    SetColorError,
    "Failed to set color to #ff0001: " +
    "Timed out after waiting for response for 2000 milliseconds",
    TimeoutError,
    "Timed out after waiting for response for 2000 milliseconds",
  );

  await assertErrorChain(
    clientError,
    SetColorError,
    "Failed to set color to #ff0001: " +
    "Timed out after waiting for response for 2000 milliseconds",
    TimeoutError,
    "Timed out after waiting for response for 2000 milliseconds",
  );
});

Deno.test("setColor should be rejected on incoming bad NOTICE (type 1)", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = setColor(client, { r: 255, g: 0, b: 1 });

  await emitAndEnd(
    "@msg-id=turbo_only_color :tmi.twitch.tv NOTICE #justinfan12345 :" +
    "Only turbo users can specify an arbitrary hex color. Use one of " +
    "the following instead: Blue, BlueViolet, CadetBlue, Chocolate, " +
    "Coral, DodgerBlue, Firebrick, GoldenRod, Green, HotPink, OrangeRed, " +
    "Red, SeaGreen, SpringGreen, YellowGreen.",
  );

  await assertErrorChain(
    promise,
    SetColorError,
    "Failed to set color to #ff0001: Bad response message:" +
    " @msg-id=turbo_only_color :tmi.twitch.tv NOTICE #justinfan12345 " +
    ":Only turbo users can specify an arbitrary hex color. " +
    "Use one of the following instead: Blue, BlueViolet, CadetBlue, " +
    "Chocolate, Coral, DodgerBlue, Firebrick, GoldenRod, Green, " +
    "HotPink, OrangeRed, Red, SeaGreen, SpringGreen, YellowGreen.",
    MessageError,
    "Bad response message: @msg-id=turbo_only_color :tmi.twitch.tv" +
    " NOTICE #justinfan12345 :Only turbo users can specify an arbitrary" +
    " hex color. Use one of the following instead: Blue, BlueViolet," +
    " CadetBlue, Chocolate, Coral, DodgerBlue, Firebrick, GoldenRod," +
    " Green, HotPink, OrangeRed, Red, SeaGreen, SpringGreen, YellowGreen.",
  );

  await assertErrorChain(
    clientError,
    SetColorError,
    "Failed to set color to #ff0001: Bad response message:" +
    " @msg-id=turbo_only_color :tmi.twitch.tv NOTICE #justinfan12345 " +
    ":Only turbo users can specify an arbitrary hex color. " +
    "Use one of the following instead: Blue, BlueViolet, CadetBlue, " +
    "Chocolate, Coral, DodgerBlue, Firebrick, GoldenRod, Green, " +
    "HotPink, OrangeRed, Red, SeaGreen, SpringGreen, YellowGreen.",
    MessageError,
    "Bad response message: @msg-id=turbo_only_color :tmi.twitch.tv " +
    "NOTICE #justinfan12345 :Only turbo users can specify an arbitrary " +
    "hex color. Use one of the following instead: Blue, BlueViolet, " +
    "CadetBlue, Chocolate, Coral, DodgerBlue, Firebrick, GoldenRod, " +
    "Green, HotPink, OrangeRed, Red, SeaGreen, SpringGreen, YellowGreen.",
  );
});

Deno.test("setColor should be rejected on incoming bad NOTICE (type 2)", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = setColor(client, { r: 255, g: 0, b: 1 });

  await emitAndEnd(
    "@msg-id=usage_color :tmi.twitch.tv NOTICE #justinfan12345 :bla bla",
  );

  await assertErrorChain(
    promise,
    SetColorError,
    "Failed to set color to #ff0001: Bad response message:" +
    " @msg-id=usage_color :tmi.twitch.tv NOTICE #justinfan12345 :bla bla",
    MessageError,
    "Bad response message: @msg-id=usage_color " +
    ":tmi.twitch.tv NOTICE #justinfan12345 :bla bla",
  );

  await assertErrorChain(
    clientError,
    SetColorError,
    "Failed to set color to #ff0001: Bad response message:" +
    " @msg-id=usage_color :tmi.twitch.tv NOTICE #justinfan12345 :bla bla",
    MessageError,
    "Bad response message: " +
    "@msg-id=usage_color :tmi.twitch.tv NOTICE #justinfan12345 :bla bla",
  );
});

Deno.test("setColor should resolve on good NOTICE", async () => {
  const { client, clientError, emitAndEnd } = await fakeConnection();

  const promise = setColor(client, { r: 255, g: 0, b: 1 });

  await emitAndEnd(
    "@msg-id=color_changed :tmi.twitch.tv NOTICE " +
    "#justinfan12345 :Your color has been changed.",
  );

  await promise;
  await clientError;
});
