import { Injectable } from '@angular/core';
import { Wall, Vector, Bot, Player, Entity, Zone } from '../models';
import { EntityRepository } from '../repositories';
import { CanvasService, CanvasContextWithViewport } from './canvas';
import { ConnectionService } from './connection';

class Controller {
  public player: Player | undefined = undefined;
  private pressedButton: Set<string> = new Set<string>();

  constructor(private entityRepository: EntityRepository, private connectionService: ConnectionService) {
    this.initHandlers();
  }

  joystickUpdate(x: number, y: number) {
    if (this.player == undefined)
      return;
    let force = new Vector(x * this.player.speed, y * this.player.speed);
    if (this.player.acceleration.x != force.x || this.player.acceleration.y != force.y) {
      this.player.applyForce(force);
      this.connectionService.userInputJoystick(x, y);
    }
  }

  private initHandlers() {
    document.body.addEventListener("keydown", this.onKeydown.bind(this));
    document.body.addEventListener("keyup", this.onKeyup.bind(this));
    document.body.addEventListener("click", this.onClick.bind(this));
    document.body.addEventListener("touchstart", this.onTouchStart.bind(this));
  }

  private onKeydown(e: KeyboardEvent): void {
    if (this.player == undefined)
      return;
    if (this.player.onKeydown(e.key) && !this.pressedButton.has(e.key)) {
      this.connectionService.userInputMove(e.key, false, this.player.pos.x, this.player.pos.y);
      this.pressedButton.add(e.key);
    }
  }

  private onKeyup(e: KeyboardEvent): void {
    if (this.player == undefined)
      return;
    if (this.player.onKeyup(e.key) && this.pressedButton.has(e.key)) {
      this.connectionService.userInputMove(e.key, true, this.player.pos.x, this.player.pos.y);
      this.pressedButton.delete(e.key);
    }
  }

  private onTouchStart(e: TouchEvent): void {
    return this.onClick({clientX: e.touches[0].clientX, clientY: e.touches[0].clientY});
  }

  private onClick(e: {clientX: number, clientY: number}): void {
    if (this.player == undefined)
      return;

    let attack: Zone | null = null;
    let defend: Zone | null = null;
    let follow: Player | null = null;
    let clickPos = new Vector(e.clientX, e.clientY);

    for (const entity of this.entityRepository.list()) {
      if (clickPos.distanceTo(entity.screenPos) > entity.size)
        continue;
      if (entity instanceof Zone) {
        if (entity.ownerId == this.player.id)
          defend = entity as Zone;
        else
          attack = entity as Zone;
        break;
      } else if (entity instanceof Player) {
        follow = entity;
        break;
      }
    }

    if (attack != null) {
      this.connectionService.userInputBot("attack", attack.pos.x, attack.pos.y);
      for (const entity of this.entityRepository.list()) {
        if (entity instanceof Bot && entity.ownerId === this.player?.id)
          entity.attack(attack as Zone);
      }
    } else if (follow != null) {
      this.connectionService.userInputBot("follow", follow.pos.x, follow.pos.y);
      for (const entity of this.entityRepository.list()) {
        if (entity instanceof Bot && entity.ownerId === this.player?.id)
          entity.follow(follow as Player);
      }
    } else if (defend != null) {
      this.connectionService.userInputBot("defend", defend.pos.x, defend.pos.y);
      for (const entity of this.entityRepository.list()) {
        if (entity instanceof Bot && entity.ownerId === this.player?.id)
          entity.defend(defend as Zone);
      }
    }
  }
}

@Injectable()
export class GameService {
  private controller: Controller;
  private lastFrame: number = 0;

  constructor(
      private canvasService: CanvasService,
      private connectionService: ConnectionService,
      private entityRepository: EntityRepository,
  ) {
    this.controller = new Controller(this.entityRepository, this.connectionService);
  }

  authorize(username: string, roomId: number): void {
    console.log("Authorize", username, roomId);
    this.connectionService.authenticate(username, roomId);

    let player = new Player(this.canvasService.onCoinsChange.bind(this.canvasService), username);
    this.controller.player = player;
    player.coins = 20;
    this.entityRepository.store(player);
    this.canvasService.setCameraFollowTo(player);
    this.canvasService.setPlayerId(player.id);

    this.entityRepository.store(new Zone(200, 200));
    let zone = new Zone(700, 300, -1);
    this.entityRepository.store(zone);
  }

  update() {
    let joystickDirection = this.canvasService.getJoystickDirection();
    this.controller.joystickUpdate(joystickDirection.x, joystickDirection.y);

    let delta = 1 - (performance.now() - this.lastFrame) / 1000;

    for (const entity of this.entityRepository.list()) {
      entity.update(delta);
      if (entity.isDead)
        this.entityRepository.remove(entity)
    }

    for (const entity1 of this.entityRepository.list()) {
      for (const entity2 of this.entityRepository.listCollided()) {
        if (entity1 == entity2)
          continue;
        if (entity1.isCollide(entity2)) {
          entity2.resolveCollision(entity1);
        }
      }
    }

    this.lastFrame = performance.now();
  }

  draw(ctx: CanvasContextWithViewport) {
    for (const entity of this.entityRepository.list()) {
      entity.draw(ctx);
    }
  }

  buyBot(): void {
    if (!this.controller.player)
      return;
    if (this.controller.player.coins < 10)
      return;
    this.controller.player.coins -= 10;
    let bot = new Bot(this.controller.player.pos.x - 1, this.controller.player.pos.y - 1, this.entityRepository, this.controller.player.id);
    this.entityRepository.store(bot);
    this.connectionService.newEntity('bot', bot.x, bot.y);
  }

  buyWall(): void {
    if (!this.controller.player)
      return;
    if (this.controller.player.coins < 10)
      return;
    this.controller.player.coins -= 10;
    let wall = new Wall(
      this.controller.player.pos.x - this.controller.player.pos.x % CanvasService.cellSize,
      this.controller.player.pos.y - this.controller.player.pos.y % CanvasService.cellSize,
      this.controller.player.id
    );
    this.entityRepository.store(wall);
    this.connectionService.newEntity('wall', wall.x, wall.y);
  }
}
