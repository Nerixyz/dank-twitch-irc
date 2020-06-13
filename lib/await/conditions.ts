import { IRCMessage } from "../message/irc/irc-message.ts";
import { NoticeMessage } from "../message/twitch-types/notice.ts";

export function matchingNotice(
  channelName: string,
  noticeIDs: string[]
): (msg: IRCMessage) => boolean {
  return (msg: IRCMessage) => {
    return (
      msg instanceof NoticeMessage &&
      msg.channelName === channelName &&
      noticeIDs.includes(msg.messageID!)
    );
  };
}
