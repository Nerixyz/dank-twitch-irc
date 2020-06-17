import { assertEquals, assertStrictEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { fakeClient, sinonFake } from "../helpers.test.ts";
import { RoomStateTracker } from "./roomstate-tracker.ts";


Deno.test("RoomstateTracker should set client.roomstateTracker on the client when applied",
  () => {
    const { client } = fakeClient(false);
    const roomStateTracker = new RoomStateTracker();

    assertStrictEquals(client.roomStateTracker, undefined);

    client.use(roomStateTracker);

    assertStrictEquals(client.roomStateTracker, roomStateTracker);
  });

Deno.test("RoomstateTracker should save/update incoming ROOMSTATE messages", async () => {
  const { client, emit, emitAndEnd } = fakeClient();
  const roomStateTracker = new RoomStateTracker();

  client.use(roomStateTracker);

  assertStrictEquals(roomStateTracker.getChannelState("randers"), undefined);

  emit(
    "@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=40286300;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #randers",
  );

  await new Promise(resolve => setTimeout(resolve));

  assertEquals(roomStateTracker.getChannelState("randers"), {
    emoteOnly: false,
    emoteOnlyRaw: "0",

    followersOnlyDuration: -1,
    followersOnlyDurationRaw: "-1",

    r9k: false,
    r9kRaw: "0",

    slowModeDuration: 0,
    slowModeDurationRaw: "0",

    subscribersOnly: false,
    subscribersOnlyRaw: "0",
  });

  // enable r9k (full roomstate)
  emit(
    "@emote-only=0;followers-only=-1;r9k=1;rituals=0;room-id=40286300;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #randers",
  );

  await new Promise(resolve => setTimeout(resolve));

  assertEquals(roomStateTracker.getChannelState("randers"), {
    emoteOnly: false,
    emoteOnlyRaw: "0",

    followersOnlyDuration: -1,
    followersOnlyDurationRaw: "-1",

    r9k: true,
    r9kRaw: "1",

    slowModeDuration: 0,
    slowModeDurationRaw: "0",

    subscribersOnly: false,
    subscribersOnlyRaw: "0",
  });

  // enable sub mode (partial roomstate)
  emitAndEnd(
    "@room-id=40286300;subs-only=1 :tmi.twitch.tv ROOMSTATE #randers",
  );
  await new Promise(resolve => setTimeout(resolve));

  assertEquals(roomStateTracker.getChannelState("randers"), {
    emoteOnly: false,
    emoteOnlyRaw: "0",

    followersOnlyDuration: -1,
    followersOnlyDurationRaw: "-1",

    r9k: true,
    r9kRaw: "1",

    slowModeDuration: 0,
    slowModeDurationRaw: "0",

    subscribersOnly: true,
    subscribersOnlyRaw: "1",
  });
});

Deno.test(
  "RoomstateTracker should ignore partial ROOMSTATE messages before the first full ROOMSTATE message",
  async () => {
    const { client, emitAndEnd } = fakeClient();
    const roomStateTracker = new RoomStateTracker();

    client.use(roomStateTracker);

    assertStrictEquals(roomStateTracker.getChannelState("randers"), undefined);

    emitAndEnd(
      "@room-id=40286300;subs-only=1 :tmi.twitch.tv ROOMSTATE #randers",
    );
    await new Promise(resolve => setTimeout(resolve));

    assertStrictEquals(roomStateTracker.getChannelState("randers"), undefined);
  });

Deno.test("RoomstateTracker should emit newChannelState on new roomstate", async () => {
  const { client, emit } = fakeClient();
  const roomStateTracker = new RoomStateTracker();
  client.use(roomStateTracker);

  const listenerCallback = sinonFake();
  roomStateTracker.on("newChannelState", listenerCallback);

  emit(
    "@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=40286300;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #randers",
  );
  client.destroy();

  await new Promise(resolve => setTimeout(resolve));

  listenerCallback.onceWithArguments(
    "randers",
    roomStateTracker.getChannelState("randers"),
  );
});

Deno.test("RoomstateTracker should emit newChannelState on updated roomstate", async () => {
  const { client, emit, emitAndEnd } = fakeClient();
  const roomStateTracker = new RoomStateTracker();
  client.use(roomStateTracker);

  emit(
    "@emote-only=0;followers-only=-1;r9k=0;rituals=0;room-id=40286300;slow=0;subs-only=0 :tmi.twitch.tv ROOMSTATE #randers",
  );

  await new Promise(resolve => setTimeout(resolve));

  const listenerCallback = sinonFake();
  roomStateTracker.on("newChannelState", listenerCallback);

  emitAndEnd(
    "@room-id=40286300;subs-only=1 :tmi.twitch.tv ROOMSTATE #randers",
  );

  await new Promise(resolve => setTimeout(resolve));

  listenerCallback.onceWithArguments(
    "randers",
    roomStateTracker.getChannelState("randers"),
  );
});
