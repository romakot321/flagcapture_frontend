import { BaseMessage } from '../models';
import { UsersMessage, isUsersMessage } from '../models';
import { AuthenticateMessage, isAuthenticateMessage } from '../models';
import { UserInputMessage, isUserInputMessage } from '../models';
import { NewEntityMessage, isNewEntityMessage } from '../models';
import { MoveInputData, BotInputData, userInputExtraIsMove, userInputExtraIsBot } from '../models';
import { UserPositionMessage, isUserPositionMessage } from '../models';

import { EntityRepository } from '../repositories';
import { Entity, Wall, Bot, Player } from '../models';


export class ConnectionService {
  private ws: WebSocket;
  private username: string | null = null;
  public isConnected: boolean = false;

  constructor(
      private openCallback: () => void,
      private entityRepository: EntityRepository,
      private url: string = "ws://localhost:9000/api/game/ws",
  ) {
    this.ws = new WebSocket(url);

    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
  }

  private onOpen() {
    this.isConnected = true;
    this.openCallback();
  }

  private onClose() {
    this.isConnected = false;
  }

  private send(msg: BaseMessage): void {
    const json = JSON.stringify(msg);
    this.ws.send(json);
  }

  private onMessage(e: MessageEvent) {
    let message = JSON.parse(e.data);
    if (isUsersMessage(message))
      this.handleUsersMessage(message as UsersMessage);
    else if (isUserInputMessage(message))
      this.handleUserInputMessage(message as UserInputMessage);
    else if (isAuthenticateMessage(message))
      this.handleAuthenticate(message as AuthenticateMessage);
    else if (isUserPositionMessage(message))
      this.handleUserPositionMessage(message as UserPositionMessage);
    else if (isNewEntityMessage(message))
      this.handleNewEntityMessage(message as NewEntityMessage);
  }

  private handleAuthenticate(msg: AuthenticateMessage) {
    console.log("Auth", msg);
    let player = new Player(undefined, msg.data.username);
    this.entityRepository.store(player);
  }

  private handleUsersMessage(msg: UsersMessage) {
    for (const playerData of msg.data.users) {
      let player = new Player(undefined, playerData.name);
      this.entityRepository.store(player);
    }
  }

  private handleUserInputMessage(msg: UserInputMessage) {
    if (userInputExtraIsMove(msg.data.extra))
      this.handleUserInputMoveMessage(msg);
    else if (userInputExtraIsBot(msg.data.extra))
      this.handleUserInputBotMessage(msg);
  }

  private handleNewEntityMessage(msg: NewEntityMessage) {
    if (msg.data.username == this.username)
      return;
    let player = this.entityRepository.getPlayer(msg.data.username as string);
    if (!player)
      return;
    let model: Entity | null = null;

    switch(msg.data.type) {
      case 'wall':
        model = new Wall(msg.data.x, msg.data.y, player.id);
        break;
      case 'bot':
        model = new Bot(msg.data.x, msg.data.y, this.entityRepository, player.id);
        break;
    }

    if (model)
      this.entityRepository.store(model);
  }

  private handleUserInputMoveMessage(msg: UserInputMessage) {
    let player = this.entityRepository.getPlayer(msg.data.username);
    if (!player)
      return;
    console.log("move", player.name, msg.data);

    if (msg.data.is_release) {
      player.onKeyup(msg.data.key);
      let extra = msg.data.extra as MoveInputData;
      player.pos.x = extra.x;
      player.pos.y = extra.y;
    } else
      player.onKeydown(msg.data.key);
  }

  private handleUserInputBotMessage(msg: UserInputMessage) {
    let player = this.entityRepository.getPlayer(msg.data.username);
    if (!player)
      return

    let extra = msg.data.extra as BotInputData;
    let actionableEntity = this.entityRepository.getNearestTo(extra.x, extra.y);
    console.log("bot", player.name, msg.data);
    if (actionableEntity == null)
      return;

    let bots = this.entityRepository.list().filter(e => e instanceof Bot) as Bot[];
    for (const bot of bots) {
      if (bot.ownerId === player.id) {
        switch (extra.command) {
          case 'attack':
            bot.attack(actionableEntity);
            break;
          case 'defend':
            bot.defend(actionableEntity);
            break;
          case 'follow':
            bot.follow(actionableEntity);
            break;
        }
      }
    }
  }

  private handleUserPositionMessage(msg: UserPositionMessage) {
    console.log("position", msg.data);
    if (msg.data.username == null)
      return;
    let player = this.entityRepository.getPlayer(msg.data.username);
    if (!player)
      return;
    player.pos.x = msg.data.x;
    player.pos.y = msg.data.y;
  }

  authenticate(username: string, roomId: number) {
    let msg: AuthenticateMessage = {
      event: 0,
      data: {username: username, room: String(roomId)}
    }
    this.username = username;
    this.send(msg);
  }

  private userInput(key: string, isRelease: boolean, extra: object) {
    let msg: UserInputMessage = {
      event: 2,
      data: {key: key, is_release: isRelease, username: this.username ?? "", extra: extra as MoveInputData | BotInputData}
    };
    this.send(msg);
  }

  userInputMove(key: string, isRelease: boolean, x: number, y: number) {
    let extra: MoveInputData = {x: x, y: y};
    this.userInput(key, isRelease, extra);
  }

  userInputBot(command: string, clickX: number, clickY: number) {  // X and Y must be in world relation
    let extra: BotInputData = {x: clickX, y: clickY, command: command};
    this.userInput("bot", false, extra);
  }

  userPosition(x: number, y: number) {
    let msg: UserPositionMessage = {
      event: 5,
      data: {username: null, x: x, y: y}
    };
    this.send(msg);
  }

  newEntity(type: string, x: number, y: number) {
    let msg: NewEntityMessage = {
      event: 3,
      data: {username: null, x: x, y: y, type: type}
    };
    this.send(msg);
  }
}
