import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";
import { IRCMessage } from "../irc/irc-message.ts";
import { CapMessage } from "../twitch-types/cap.ts";
import { ClearchatMessage } from "../twitch-types/clearchat.ts";
import { ClearmsgMessage } from "../twitch-types/clearmsg.ts";
import { PingMessage } from "../twitch-types/connection/ping.ts";
import { PongMessage } from "../twitch-types/connection/pong.ts";
import { ReconnectMessage } from "../twitch-types/connection/reconnect.ts";
import { GlobaluserstateMessage } from "../twitch-types/globaluserstate.ts";
import { HosttargetMessage } from "../twitch-types/hosttarget.ts";
import { JoinMessage } from "../twitch-types/membership/join.ts";
import { PartMessage } from "../twitch-types/membership/part.ts";
import { NoticeMessage } from "../twitch-types/notice.ts";
import { PrivmsgMessage } from "../twitch-types/privmsg.ts";
import { RoomstateMessage } from "../twitch-types/roomstate.ts";
import { UsernoticeMessage } from "../twitch-types/usernotice.ts";
import { UserstateMessage } from "../twitch-types/userstate.ts";
import { WhisperMessage } from "../twitch-types/whisper.ts";
import { parseIRCMessage } from "./irc-message.ts";
import { parseTwitchMessage } from "./twitch-message.ts";
import { assertInstanceOf } from "https://deno.land/x/explicitly/mod.ts";


const testCases = [
  {
    irc:
      "@ban-duration=5;room-id=11148817;target-user-id=70948394;tmi-sent-ts=1562587662677 " +
      ":tmi.twitch.tv CLEARCHAT #pajlada :weeb123",
    instanceOf: ClearchatMessage,
  },
  {
    irc:
      "@login=supinic;room-id=;target-msg-id=e8a4dcfe-9db3-43eb-98d4-b5101ba6a20e;" +
      "tmi-sent-ts=-6795364578871 :tmi.twitch.tv CLEARMSG #pajlada :this is retarded",
    instanceOf: ClearmsgMessage,
  },
  {
    irc:
      "@badge-info=;badges=;color=;display-name=receivertest3;emote-sets=0;user-id=" +
      "422021310;user-type= :tmi.twitch.tv GLOBALUSERSTATE",
    instanceOf: GlobaluserstateMessage,
  },
  {
    irc: ":tmi.twitch.tv HOSTTARGET #randers :redshell 0",
    instanceOf: HosttargetMessage,
  },
  {
    irc:
      "@msg-id=host_on :tmi.twitch.tv NOTICE #randers :Now hosting Redshell.",
    instanceOf: NoticeMessage,
  },
  {
    irc:
      "@badge-info=subscriber/10;badges=moderator/1,subscriber/6,sub-gifter/1;" +
      "color=#19E6E6;display-name=randers;emotes=;flags=;id=0e7f0a13-3885-42a3-ab23-722b874eb864;" +
      "mod=1;room-id=11148817;subscriber=1;tmi-sent-ts=1562588302071;turbo=0;user-id=40286300;" +
      "user-type=mod :randers!randers@randers.tmi.twitch.tv PRIVMSG #pajlada :asd",
    instanceOf: PrivmsgMessage,
  },
  {
    irc: "@emote-only=1;room-id=40286300 :tmi.twitch.tv ROOMSTATE #randers",
    instanceOf: RoomstateMessage,
  },
  {
    irc:
      "@badge-info=;badges=subscriber/0,premium/1;color=;display-name=FletcherCodes;" +
      "emotes=;flags=;id=57cbe8d9-8d17-4760-b1e7-0d888e1fdc60;login=fletchercodes;mod=0;" +
      "msg-id=sub;msg-param-cumulative-months=0;msg-param-months=0;" +
      "msg-param-should-share-streak=0;msg-param-sub-plan-name=The\\sWhatevas;" +
      "msg-param-sub-plan=Prime;room-id=408892348;subscriber=1;system-msg=fletchercodes" +
      "\\ssubscribed\\swith\\sTwitch\\sPrime.;tmi-sent-ts=1551486064328;" +
      "turbo=0;user-id=269899575;user-type= :tmi.twitch.tv USERNOTICE #clippyassistant",
    instanceOf: UsernoticeMessage,
  },
  {
    irc:
      "@badge-info=;badges=;color=;display-name=receivertest3;emote-sets=0;mod=0;" +
      "subscriber=0;user-type= :tmi.twitch.tv USERSTATE #randers",
    instanceOf: UserstateMessage,
  },
  {
    irc:
      "@badges=;color=#19E6E6;display-name=randers;emotes=;message-id=1;" +
      "thread-id=40286300_422021310;turbo=0;user-id=40286300;user-type= " +
      ":randers!randers@randers.tmi.twitch.tv WHISPER receivertest3 :test",
    instanceOf: WhisperMessage,
  },
  {
    irc:
      ":receivertest3!receivertest3@receivertest3.tmi.twitch.tv JOIN #randers",
    instanceOf: JoinMessage,
  },
  {
    irc:
      ":receivertest3!receivertest3@receivertest3.tmi.twitch.tv PART #randers",
    instanceOf: PartMessage,
  },
  {
    irc: ":tmi.twitch.tv RECONNECT",
    instanceOf: ReconnectMessage,
  },
  {
    irc: ":tmi.twitch.tv PING",
    instanceOf: PingMessage,
  },
  {
    irc: "PONG :tmi.twitch.tv",
    instanceOf: PongMessage,
  },
  {
    irc: ":tmi.twitch.tv CAP * ACK :twitch.tv/commands twitch.tv/tags",
    instanceOf: CapMessage,
  },
];

for (const { irc, instanceOf } of testCases) {
  const ircMessage = parseIRCMessage(irc);
  const command = ircMessage.ircCommand;

  Deno.test(`parseTwitchpMessage should map ${command} to ${instanceOf.name}`, () => {
    const twitchMessage = parseTwitchMessage(irc);

    assertInstanceOf(twitchMessage, instanceOf);
  });
}

Deno.test("parseTwitchpMessage should leave unknown commands as bare IRCMessages", () => {
  const parsed = parseTwitchMessage(":tmi.twitch.tv UNKNOWN");
  assertStrictEquals(Object.getPrototypeOf(parsed), IRCMessage.prototype);
});

Deno.test("parseTwitchpMessage should leave numeric commands as bare IRCMessages", () => {
  const parsed = parseTwitchMessage(":tmi.twitch.tv 001");
  assertStrictEquals(Object.getPrototypeOf(parsed), IRCMessage.prototype);
});
