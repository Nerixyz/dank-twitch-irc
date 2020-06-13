import { ChannelIRCMessage } from "../../irc/channel-irc-message.ts";
import { IRCMessageData, requireNickname } from "../../irc/irc-message.ts";

export class JoinMessage extends ChannelIRCMessage {
  public readonly joinedUsername: string;

  public constructor(message: IRCMessageData) {
    super(message);
    this.joinedUsername = requireNickname(this);
  }
}
