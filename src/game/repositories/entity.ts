import { Injectable } from '@angular/core';
import { Entity } from '../models';


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
