import { Injectable } from '@angular/core';
import { Vector, Entity, Player } from '../models';


@Injectable()
export class EntityRepository {
  private entities: Entity[] = [];
  private collidedEntities: Entity[] = [];

  constructor() { }

  store(model: Entity) {
    if (model.collided)
      this.collidedEntities.push(model);
    this.entities.push(model);
  }

  list(): Entity[] {
    return this.entities;
  }

  listCollided(): Entity[] {
    return this.collidedEntities;
  }

  listPlayers(): Player[] {
    return this.entities.filter(e => e instanceof Player) as Player[];
  }

  getPlayer(name: string): Player | null {
    let founded = this.listPlayers().filter(e => e.name === name);
    if (founded.length == 0)
      return null;
    return founded[0];
  }

  getNearestTo(x: number, y: number): Entity | null {
    let nearest: Entity | null = null;
    let minDist: number = Infinity;
    let point = new Vector(x, y);

    for (const entity of this.entities) {
      const dist = entity.pos.distanceTo(point);
      if (dist < minDist) {
        nearest = entity;
        minDist = dist;
      }
    }

    return nearest;
  }

  remove(model: Entity) {
    for (const entity of this.entities) {
      if (entity === model)
        this.entities.splice(this.entities.indexOf(entity), 1);
    }
    for (const entity of this.collidedEntities) {
      if (entity === model)
        this.collidedEntities.splice(this.collidedEntities.indexOf(entity), 1);
    }
  }
}
