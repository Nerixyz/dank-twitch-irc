import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { fakeConnection, switchToImmediateTimeout } from "../helpers.test.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { sendPrivmsg } from "./privmsg.ts";

Deno.test("sendPrivmsg should send the correct wire command", async () => {
  const { client, data } = await fakeConnection();

  await switchToImmediateTimeout(
    () => sendPrivmsg(client, "forsen", "Kappa Keepo PogChamp").catch(ignoreErrors));

  assertEquals(data, [
    "PRIVMSG #forsen :Kappa Keepo PogChamp\r\n",
  ]);
});
