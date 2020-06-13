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

// import { T } from 'ts-toolbelt';
// export const list = [
//    ClearchatMessage,
//    ClearmsgMessage,
//    GlobaluserstateMessage,
//    HosttargetMessage,
//    NoticeMessage,
//    PrivmsgMessage,
//    RoomstateMessage,
//    UsernoticeMessage,
//    UserstateMessage,
//    WhisperMessage,
//    JoinMessage,
//    PartMessage,
//    ReconnectMessage,
//    PingMessage,
//    PongMessage
// ] as const;
//
// type x = typeof list;
// type Commands = { [K in Exclude<keyof x, keyof any[]>]: x[K]['command'] } & { length: x['length'] } & any[];
// type Instances = { [K in Exclude<keyof x, keyof any[]>]: x[K] } & { length: x['length'] } & any[];
// type Map = T.ZipObj<Commands, x>;

export const commandClassMap: {
  CLEARCHAT: typeof ClearchatMessage;
  CLEARMSG: typeof ClearmsgMessage;
  GLOBALUSERSTATE: typeof GlobaluserstateMessage;
  HOSTTARGET: typeof HosttargetMessage;
  NOTICE: typeof NoticeMessage;
  PRIVMSG: typeof PrivmsgMessage;
  ROOMSTATE: typeof RoomstateMessage;
  USERNOTICE: typeof UsernoticeMessage;
  USERSTATE: typeof UserstateMessage;
  WHISPER: typeof WhisperMessage;
  JOIN: typeof JoinMessage;
  PART: typeof PartMessage;
  RECONNECT: typeof ReconnectMessage;
  PING: typeof PingMessage;
  PONG: typeof PongMessage;
  CAP: typeof CapMessage;

  [key: string]: typeof IRCMessage;
} = {
  CLEARCHAT: ClearchatMessage,
  CLEARMSG: ClearmsgMessage,
  GLOBALUSERSTATE: GlobaluserstateMessage,
  HOSTTARGET: HosttargetMessage,
  NOTICE: NoticeMessage,
  PRIVMSG: PrivmsgMessage,
  ROOMSTATE: RoomstateMessage,
  USERNOTICE: UsernoticeMessage,
  USERSTATE: UserstateMessage,
  WHISPER: WhisperMessage,
  JOIN: JoinMessage,
  PART: PartMessage,
  RECONNECT: ReconnectMessage,
  PING: PingMessage,
  PONG: PongMessage,
  CAP: CapMessage,
} as const;

export type TwitchCommands = typeof commandClassMap;

export function parseTwitchMessage(messageSrc: string): IRCMessage {
  const ircMessage = parseIRCMessage(messageSrc);

  const constructor = commandClassMap[ircMessage.ircCommand];
  if (constructor == null) {
    return ircMessage;
  } else {
    return new constructor(ircMessage);
  }
}
