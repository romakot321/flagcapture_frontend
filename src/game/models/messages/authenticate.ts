import { BaseMessage } from './base';


export interface AuthenticateMessage extends BaseMessage {
  event: number;
  data: {username: string, room: string};
}

export function isAuthenticateMessage(message: any): message is AuthenticateMessage {
  return (
    typeof message.event === 'number' &&
    message.event === 0 &&
    typeof message.data === "object" &&
    'username' in message.data &&
    'room' in message.data &&
    typeof message.data.username === "string" &&
    typeof message.data.room === "string"
  )
}
