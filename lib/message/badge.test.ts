import { TwitchBadge } from "./badge.ts";
import { assertStrictEquals, assert } from "https://deno.land/std/testing/asserts.ts";


const testCases: [string, string, (b: TwitchBadge) => boolean][] = [
  ["admin", "1", (b) => b.isAdmin],
  ["bits", "1", (b) => b.isBits],
  ["bits", "1000", (b) => b.isBits],
  ["broadcaster", "1", (b) => b.isBroadcaster],
  ["global_mod", "1", (b) => b.isGlobalMod],
  ["moderator", "1", (b) => b.isModerator],
  ["subscriber", "1", (b) => b.isSubscriber],
  ["subscriber", "6", (b) => b.isSubscriber],
  ["subscriber", "12", (b) => b.isSubscriber],
  ["subscriber", "15", (b) => b.isSubscriber],
  ["staff", "1", (b) => b.isStaff],
  ["turbo", "1", (b) => b.isTurbo],
  ["vip", "1", (b) => b.isVIP],
];

for (const [badgeName, badgeVersion, getter] of testCases) {
  Deno.test(`TwitchBadge should recognize ${badgeName}/${badgeVersion}`, () => assert(getter(new TwitchBadge(
    badgeName,
    badgeVersion))));
}

Deno.test("TwitchBadge should return badgeName/badgeVersion from toString()", () => {
  assertStrictEquals(
    new TwitchBadge("subscriber", "1").toString(),
    "subscriber/1",
  );
  assertStrictEquals(
    new TwitchBadge("subscriber", "10").toString(),
    "subscriber/10",
  );
});

Deno.test("TwitchBadge should return badgeName/badgeVersion from implcit toString() conversion", () => {
  assertStrictEquals(
    new TwitchBadge("subscriber", "10") + "",
    "subscriber/10",
  );
  assertStrictEquals(
    `${new TwitchBadge("subscriber", "10")}`,
    "subscriber/10",
  );
});
