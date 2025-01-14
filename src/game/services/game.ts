import { Injectable } from '@angular/core';
import { Wall, Vector, Bot, Player, Entity, Zone } from '../models';
import { EntityRepository } from '../repositories';
import { CanvasService, CanvasContextWithViewport } from './canvas';

class Controller {
  public player: Player | undefined = undefined;

  constructor(private entityRepository: EntityRepository) {
    this.initHandlers();
  }

  joystickUpdate(x: number, y: number) {
    if (this.player == undefined)
      return;
    this.player.applyForce(new Vector(x * this.player.speed, y * this.player.speed));
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
    this.player.onKeydown(e.key);
  }

  private onKeyup(e: KeyboardEvent): void {
    if (this.player == undefined)
      return;
    this.player.onKeyup(e.key);
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
      for (const entity of this.entityRepository.list()) {
        if (entity instanceof Bot && entity.ownerId === this.player?.id)
          entity.attack(attack as Zone);
      }
    } else if (follow != null) {
      for (const entity of this.entityRepository.list()) {
        if (entity instanceof Bot && entity.ownerId === this.player?.id)
          entity.follow(follow as Player);
      }
    } else if (defend != null) {
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
  private entityRepository: EntityRepository;
  private lastFrame: number = 0;

  constructor(private canvasService: CanvasService) {
    this.entityRepository = new EntityRepository();
    this.controller = new Controller(this.entityRepository);
  }

  authorize(username: string, roomId: number): void {
    console.log("Authorize", username, roomId);

    let player = new Player(this.canvasService.onCoinsChange.bind(this.canvasService));
    this.controller.player = player;
    player.coins = 20;
    this.entityRepository.store(player);
    this.canvasService.setCameraFollowTo(player);
    this.canvasService.setPlayerId(player.id);

    this.entityRepository.store(new Zone(200, 200));
    let zone = new Zone(700, 300, player.id + 1);
    this.entityRepository.store(zone);

    for (let i = 0; i < 2; i++) {
      let bot1 = new Bot(window.innerWidth - (50 + i * Bot.size * 2), 1000, this.entityRepository, player.id + 1);
      bot1.defend(zone);
      this.entityRepository.store(bot1);
    }
    for (let i = 0; i < 1; i++) {
      let bot = new Bot(50 + i * Bot.size * 2, window.innerHeight / 2, this.entityRepository, player.id);
      this.entityRepository.store(bot);
    }
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
    for (const entity of this.entityRepository.list())
      entity.draw(ctx);
  }

  buyBot(): void {
    if (!this.controller.player)
      return;
    if (this.controller.player.coins < 10)
      return;
    this.controller.player.coins -= 10;
    let bot = new Bot(this.controller.player.pos.x - 1, this.controller.player.pos.y - 1, this.entityRepository, this.controller.player.id);
    this.entityRepository.store(bot);
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
  }
}
