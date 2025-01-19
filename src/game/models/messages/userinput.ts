import { BaseMessage } from './base';


export interface MoveInputData {
  x: number;
  y: number;
}

export interface BotInputData {
  x: number;
  y: number;
  command: string;
}

export interface UserInputMessage extends BaseMessage {
  event: number;
  data: {
    key: string,
    is_release: boolean,
    username: string,
    extra: MoveInputData | BotInputData,
  };
}

export function isUserInputMessage(message: any): message is UserInputMessage {
  return (
    typeof message.event === 'number' &&
    message.event === 2 &&
    typeof message.data === "object" &&
    'key' in message.data &&
    'is_release' in message.data &&
    'username' in message.data &&
    'extra' in message.data &&
    typeof message.data.key === "string" &&
    typeof message.data.username === "string" &&
    typeof message.data.extra === "object" &&
    (userInputExtraIsBot(message.data.extra) || userInputExtraIsMove(message.data.extra))
  )
}

export function userInputExtraIsMove(extra: any): extra is MoveInputData {
  return (
    typeof extra === 'object' &&
    'x' in extra &&
    'y' in extra &&
    !('command' in extra) &&
    typeof extra.x === 'number' &&
    typeof extra.y === 'number'
  )
}

export function userInputExtraIsBot(extra: any): extra is BotInputData {
  return (
    typeof extra === 'object' &&
    'command' in extra &&
    'x' in extra &&
    'y' in extra &&
    typeof extra.x === 'number' &&
    typeof extra.y === 'number' &&
    typeof extra.command === 'string'
  )
}
