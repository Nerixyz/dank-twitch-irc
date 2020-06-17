import { TwitchBadge } from "./badge.ts";
import { TwitchBadgesList } from "./badges.ts";
import { assertStrictEquals, assert } from "https://deno.land/std/testing/asserts.ts";


const testCases: [string, string, (b: TwitchBadgesList) => boolean][] = [
  ["admin", "1", (b) => b.hasAdmin],
  ["bits", "1", (b) => b.hasBits],
  ["bits", "1000", (b) => b.hasBits],
  ["broadcaster", "1", (b) => b.hasBroadcaster],
  ["global_mod", "1", (b) => b.hasGlobalMod],
  ["moderator", "1", (b) => b.hasModerator],
  ["subscriber", "1", (b) => b.hasSubscriber],
  ["subscriber", "6", (b) => b.hasSubscriber],
  ["subscriber", "12", (b) => b.hasSubscriber],
  ["subscriber", "15", (b) => b.hasSubscriber],
  ["staff", "1", (b) => b.hasStaff],
  ["turbo", "1", (b) => b.hasTurbo],
  ["vip", "1", (b) => b.hasVIP],
];

for (const [badgeName, badgeVersion, getter] of testCases) {
  Deno.test(`TwitchBadgesList should recognize ${badgeName}/${badgeVersion}`, () => {
    const badgeList = new TwitchBadgesList();
    badgeList.push(new TwitchBadge(badgeName, badgeVersion));
    assert(getter(badgeList));
  });
}

Deno.test("TwitchBadgesList should return badge1,badge2,badge3 from toString()", () => {
  const list = new TwitchBadgesList();
  list.push(
    new TwitchBadge("admin", "1"),
    new TwitchBadge("vip", "1"),
    new TwitchBadge("subscriber", "12"),
  );

  assertStrictEquals("admin/1,vip/1,subscriber/12", list.toString());
});

Deno.test("TwitchBadgesList should return badge1,badge2,badge3 from implicit toString()", () => {
  const list = new TwitchBadgesList();
  list.push(
    new TwitchBadge("admin", "1"),
    new TwitchBadge("vip", "1"),
    new TwitchBadge("subscriber", "12"),
  );

  assertStrictEquals("admin/1,vip/1,subscriber/12", `${list.toString()}`);
  assertStrictEquals("admin/1,vip/1,subscriber/12", list + "");
});
