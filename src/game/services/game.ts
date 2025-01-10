import { Injectable } from '@angular/core';
import { Player, Entity, Zone } from '../models';

class Controller {
  public player: Player | undefined = undefined;

  constructor() {
    this.initHandlers();
  }

  initHandlers() {
    document.body.addEventListener("keydown", this.onKeydown.bind(this));
    document.body.addEventListener("keyup", this.onKeyup.bind(this));
  }

  private onKeydown(e: KeyboardEvent): void {
    if (this.player == undefined)
      return;
    console.log(this.player.coins)
    this.player.onKeydown(e.key);
  }

  private onKeyup(e: KeyboardEvent): void {
    if (this.player == undefined)
      return;
    this.player.onKeyup(e.key);
  }
}

@Injectable()
export class GameService {
  entities: Entity[] = [];
  zones: Zone[] = [
    new Zone(200, 200),
    new Zone(1000, 200),
    new Zone(200, 800),
    new Zone(1000, 800),
  ];
  private controller: Controller;
  private lastFrame: number = 0;

  constructor() {
    this.controller = new Controller();
  }

  authorize(username: string, roomId: number): void {
    console.log("Authorize", username, roomId);

    let player = new Player();
    this.controller.player = player;
    this.entities.push(player);
    this.entities.push(...this.zones);
  }

  update() {
    let delta = 1 - (performance.now() - this.lastFrame) / 1000;
    for (const entity of this.entities) {
      entity.update(delta);
      for (const zone of this.zones) {
        if (entity == zone)
          continue;
        if (entity.isCollide(zone))
          zone.resolveCollision(entity);
      }
    }
    this.lastFrame = performance.now();
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const entity of this.entities)
      entity.draw(ctx);
  }
}
