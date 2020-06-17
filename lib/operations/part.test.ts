import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { TimeoutError } from "../await/timeout-error.ts";
import {
  assertErrorChain,
  assertSameMembers,
  fakeConnection,
  switchToImmediateTimeout,
} from "../helpers.test.ts";
import { ignoreErrors } from "../utils/ignore-errors.ts";
import { joinNothingToDo } from "./join.ts";
import { partChannel, PartError, partNothingToDo } from "./part.ts";
import { assertFalse, assertTrue } from "https://deno.land/x/explicitly/mod.ts";


   Deno.test("partNothingToDo should be true if channel is not joined or wanted", async() => {
      // channel is not joined and is not wanted either
      // (e.g. no join in progress)
      const { client } = await fakeConnection();

      client.wantedChannels.clear();

      client.joinedChannels.clear();

      assertTrue(partNothingToDo(client, "pajlada"));
    });

   Deno.test("partNothingToDo should be false if channel is joined but not wanted", async () => {
      // e.g. previous PART command failed, and channel remained joined
      // but not wanted.
      const { client } = await fakeConnection();

      client.wantedChannels.clear();

      client.joinedChannels.clear();
      client.joinedChannels.add("pajlada");

      assertFalse(partNothingToDo(client, "pajlada"));
    });

   Deno.test("partNothingToDo should be false if channel is not joined but wanted",  async () => {
      // e.g. JOIN is currently in progress and we want to part already
      // again

      const { client } = await fakeConnection();

      client.wantedChannels.clear();
      client.wantedChannels.add("pajlada");

      client.joinedChannels.clear();

      assertFalse(partNothingToDo(client, "pajlada"));
    });

   Deno.test("partNothingToDo should be false if channel is joined and wanted", async () => {
      // normal situation where channel is joined and wanted and must be
      // parted.
      const { client } = await fakeConnection();

      client.wantedChannels.clear();
      client.wantedChannels.add("pajlada");

      client.joinedChannels.clear();

      assertFalse(joinNothingToDo(client, "pajlada"));
    });


   Deno.test("partChannel should send the correct wire command",  async () => {
      const { client, data, clientError } = await fakeConnection();
      clientError.catch(ignoreErrors);
      client.joinedChannels.add("pajlada");
      client.wantedChannels.add("pajlada");

      await switchToImmediateTimeout(() => partChannel(client, "pajlada").catch(ignoreErrors));

      assertEquals(data, ["PART #pajlada\r\n"]);
    });

   Deno.test("partChannel should do nothing if channel is neither wanted nor joined", async () => {
      const { client, data } = await fakeConnection();

      await partChannel(client, "pajlada");

      assertEquals(data, []);
    });

   Deno.test("partChannel should remove channel from wanted channels even on timeout error", async () => {

      const { client, clientError } = await fakeConnection();
      client.joinedChannels.add("pajlada");
      client.wantedChannels.add("pajlada");

      const promise = switchToImmediateTimeout(() => partChannel(client, "pajlada"));

      await assertErrorChain(
        promise,
        PartError,
        "Failed to part channel pajlada: Timed out after waiting for response for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      await assertErrorChain(
        clientError,
        PartError,
        "Failed to part channel pajlada: Timed out after waiting for response for 2000 milliseconds",
        TimeoutError,
        "Timed out after waiting for response for 2000 milliseconds"
      );

      assertSameMembers([...client.joinedChannels], ["pajlada"]);
      assertSameMembers([...client.wantedChannels], []);
    });

   Deno.test("partChannel should remove channel from joined and wanted channels on success", async () => {
      const { client, emitAndEnd, clientError } = await fakeConnection();
      client.joinedChannels.add("pajlada");
      client.wantedChannels.add("pajlada");

      const promise = partChannel(client, "pajlada");

      await emitAndEnd(
        ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv PART #pajlada"
      );

      await promise;

      assertSameMembers([...client.joinedChannels], []);
      assertSameMembers([...client.wantedChannels], []);

      await clientError;
    });
