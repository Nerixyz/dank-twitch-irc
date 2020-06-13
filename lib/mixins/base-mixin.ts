import { ChatClient } from "../client/client.ts";
import { SingleConnection } from "../client/connection.ts";

export interface ClientMixin {
  applyToClient(client: ChatClient): void;
}

export interface ConnectionMixin {
  applyToConnection(connection: SingleConnection): void;
}
