import { TwitchBadgesList } from "../badges.ts";
import { Color } from "../color.ts";
import { IRCMessage, IRCMessageData } from "../irc/irc-message.ts";
import { TwitchEmoteSets } from "../parser/emote-sets.ts";
import { tagParserFor } from "../parser/tag-values.ts";

/**
 * Global state of the logged in user.
 */
export interface GlobalUserState {
  badgeInfo: TwitchBadgesList;
  badgeInfoRaw: string;
  badges: TwitchBadgesList;
  badgesRaw: string;
  color: Color | undefined;
  colorRaw: string;
  displayName: string;
  emoteSets: TwitchEmoteSets;
  emoteSetsRaw: string;
  userID: string;
}

export class GlobaluserstateMessage extends IRCMessage
  implements GlobalUserState {
  public readonly badgeInfo: TwitchBadgesList;
  public readonly badgeInfoRaw: string;
  public readonly badges: TwitchBadgesList;
  public readonly badgesRaw: string;
  public readonly color: Color | undefined;
  public readonly colorRaw: string;
  public readonly displayName: string;
  public readonly emoteSets: TwitchEmoteSets;
  public readonly emoteSetsRaw: string;
  public readonly userID: string;

  public constructor(message: IRCMessageData) {
    super(message);

    const tagParser = tagParserFor(this.ircTags);
    this.badgeInfo = tagParser.requireBadges("badge-info");
    this.badgeInfoRaw = tagParser.requireString("badge-info");
    this.badges = tagParser.requireBadges("badges");
    this.badgesRaw = tagParser.requireString("badges");
    this.color = tagParser.getColor("color");
    this.colorRaw = tagParser.requireString("color");
    this.displayName = tagParser.requireString("display-name");
    this.emoteSets = tagParser.requireEmoteSets("emote-sets");
    this.emoteSetsRaw = tagParser.requireString("emote-sets");
    this.userID = tagParser.requireString("user-id");
  }

  /**
   * Extracts a plain object only containing the fields defined by the
   * {@link GlobalUserState} interface.
   */
  public extractGlobalUserState(): GlobalUserState {
    return {
      badgeInfo: this.badgeInfo,
      badgeInfoRaw: this.badgeInfoRaw,
      badges: this.badges,
      badgesRaw: this.badgesRaw,
      color: this.color,
      colorRaw: this.colorRaw,
      displayName: this.displayName,
      emoteSets: this.emoteSets,
      emoteSetsRaw: this.emoteSetsRaw,
      userID: this.userID,
    };
  }
}
