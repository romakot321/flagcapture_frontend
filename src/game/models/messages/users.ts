import { BaseMessage } from './base';


export interface UsersMessage extends BaseMessage {
  event: number;
  data: {users: any[]};
}

export function isUsersMessage(message: any): message is UsersMessage {
  return (
    typeof message.event === 'number' &&
    message.event === 4 &&
    typeof message.data === "object" &&
    'users' in message.data &&
    typeof message.data.users === "object"
  )
}
