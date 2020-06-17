import { assertStrictEquals, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { TwitchBadge } from "../badge.ts";
import { TwitchBadgesList } from "../badges.ts";
import { parseTwitchMessage } from "../parser/twitch-message.ts";
import { GlobaluserstateMessage } from "./globaluserstate.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


Deno.test(
  "GlobaluserstateMessage should be able to parse a real extensive GLOBALUSERSTATE message from twitch",
  () => {
    const msgText =
      "@badge-info=;badges=bits-charity/1;color=#19E6E6;display-name=RANDERS;" +
      "emote-sets=0,42,237,1564,1627,1937,2344,2470,4236,14417,15961,19194,198648,241281," +
      "445556,520063,771848,905510,1056965,1537462,1598955,1641460,1641461,1641462,300206295;" +
      "user-id=40286300;user-type= :tmi.twitch.tv GLOBALUSERSTATE";

    const msg: GlobaluserstateMessage = parseTwitchMessage(
      msgText,
    ) as GlobaluserstateMessage;

    assertInstanceOf(msg, GlobaluserstateMessage);

    assertEquals(msg.badgeInfo, new TwitchBadgesList());
    assertStrictEquals(msg.badgeInfoRaw, "");

    assertEquals(
      msg.badges,
      new TwitchBadgesList(new TwitchBadge("bits-charity", "1")),
    );
    assertStrictEquals(msg.badgesRaw, "bits-charity/1");

    assertEquals(msg.color, { r: 0x19, g: 0xe6, b: 0xe6 });
    assertStrictEquals(msg.colorRaw, "#19E6E6");

    assertStrictEquals(msg.displayName, "RANDERS");

    assertEquals(msg.emoteSets, [
      "0",
      "42",
      "237",
      "1564",
      "1627",
      "1937",
      "2344",
      "2470",
      "4236",
      "14417",
      "15961",
      "19194",
      "198648",
      "241281",
      "445556",
      "520063",
      "771848",
      "905510",
      "1056965",
      "1537462",
      "1598955",
      "1641460",
      "1641461",
      "1641462",
      "300206295",
    ]);
    assertStrictEquals(
      msg.emoteSetsRaw,
      "0,42,237,1564,1627,1937,2344,2470,4236,14417,15961,19194,198648," +
      "241281,445556,520063,771848,905510,1056965,1537462,1598955,1641460,1641461,1641462,300206295",
    );

    assertStrictEquals("40286300", msg.userID);

    assertEquals(msg.extractGlobalUserState(), {
      badgeInfo: new TwitchBadgesList(),
      badgeInfoRaw: "",

      badges: new TwitchBadgesList(new TwitchBadge("bits-charity", "1")),
      badgesRaw: "bits-charity/1",

      color: { r: 0x19, g: 0xe6, b: 0xe6 },
      colorRaw: "#19E6E6",

      displayName: "RANDERS",

      emoteSets: [
        "0",
        "42",
        "237",
        "1564",
        "1627",
        "1937",
        "2344",
        "2470",
        "4236",
        "14417",
        "15961",
        "19194",
        "198648",
        "241281",
        "445556",
        "520063",
        "771848",
        "905510",
        "1056965",
        "1537462",
        "1598955",
        "1641460",
        "1641461",
        "1641462",
        "300206295",
      ],
      emoteSetsRaw:
        "0,42,237,1564,1627,1937,2344,2470,4236,14417,15961,19194,198648," +
        "241281,445556,520063,771848,905510,1056965,1537462,1598955,1641460,1641461,1641462,300206295",

      userID: "40286300",
    });
  });

Deno.test(
  "GlobaluserstateMessage should be able to parse a real minimal GLOBALUSERSTATE message from twitch",
  () => {
    const msgText =
      "@badge-info=;badges=;color=;display-name=receivertest3;emote-sets=0;user-id=422021310;" +
      "user-type= :tmi.twitch.tv GLOBALUSERSTATE";

    const msg: GlobaluserstateMessage = parseTwitchMessage(
      msgText,
    ) as GlobaluserstateMessage;

    assertInstanceOf(msg, GlobaluserstateMessage);

    assertEquals(msg.badgeInfo, new TwitchBadgesList());
    assertStrictEquals(msg.badgeInfoRaw, "");

    assertEquals(msg.badges, new TwitchBadgesList());
    assertStrictEquals(msg.badgesRaw, "");

    assertStrictEquals(msg.color, undefined);
    assertStrictEquals(msg.colorRaw, "");

    assertStrictEquals(msg.displayName, "receivertest3");

    assertEquals(msg.emoteSets, ["0"]);
    assertStrictEquals(msg.emoteSetsRaw, "0");

    assertStrictEquals("422021310", msg.userID);

    assertEquals(msg.extractGlobalUserState(), {
      badgeInfo: new TwitchBadgesList(),
      badgeInfoRaw: "",

      badges: new TwitchBadgesList(),
      badgesRaw: "",

      color: undefined,
      colorRaw: "",

      displayName: "receivertest3",

      emoteSets: ["0"],
      emoteSetsRaw: "0",

      userID: "422021310",
    });
  });
