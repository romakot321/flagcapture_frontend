import { BaseMessage } from './base';


export interface NewEntityMessage extends BaseMessage {
  event: number;
  data: {username: string | null, x: number, y: number, type: string};
}

export function isNewEntityMessage(message: any): message is NewEntityMessage {
  return (
    typeof message.event === 'number' &&
    message.event === 3 &&
    typeof message.data === "object" &&
    'username' in message.data &&
    'x' in message.data &&
    'y' in message.data &&
    'type' in message.data &&
    typeof message.data.username === "string" &&
    typeof message.data.x === "number" &&
    typeof message.data.y === "number" &&
    typeof message.data.type === "string"
  )
}
