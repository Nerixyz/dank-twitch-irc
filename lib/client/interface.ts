import { IRCMessage } from "../message/irc/irc-message.ts";
import { TwitchCommands } from "../message/parser/twitch-message.ts";
import { SingleConnection } from "./connection.ts";

export enum ClientState {
  UNCONNECTED,
  CONNECTING,
  CONNECTED,
  READY,
  CLOSED,
}

export interface ClientStateChangeEvent {
  oldState: ClientState;
  newState: ClientState;
}

export interface SpecificConnectionEvents {
  connecting: [];
  connect: [];
  ready: [];
  close: [Error | undefined];
  error: [Error];

  message: [IRCMessage];
}

export interface SpecificClientEvents {
  connecting: [];
  connect: [];
  ready: [];
  close: [Error | undefined];
  error: [Error];

  message: [IRCMessage];

  reconnect: [SingleConnection];
}

// these are the events that are mapped to twitch messages (e.g. PRIVMSG)
export type TwitchMessageEvents = {
  [P in keyof TwitchCommands]: [InstanceType<TwitchCommands[P]>];
};

// these are all other messages that are not mapped to twitch messages specifically, e.g. 001
export interface IRCMessageEvents {
  [command: string]: [IRCMessage];
}

export type ClientEvents = SpecificClientEvents &
  TwitchMessageEvents &
  IRCMessageEvents;
