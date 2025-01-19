import { BaseMessage } from './base';


export interface UserPositionMessage extends BaseMessage {
  event: number;
  data: {username: string | null, x: number, y: number};
}

export function isUserPositionMessage(message: any): message is UserPositionMessage {
  return (
    typeof message.event === 'number' &&
    message.event === 5 &&
    typeof message.data === "object" &&
    'username' in message.data &&
    'x' in message.data &&
    'y' in message.data &&
    typeof message.data.username === "string" &&
    typeof message.data.x === "number" &&
    typeof message.data.y === "number"
  )
}
