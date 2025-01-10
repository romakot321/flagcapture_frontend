import { Entity, Vector } from './entity';

export class Player extends Entity {
  public coins: number = 0;
  private force: Vector = new Vector(0, 0);

  override update(delta: number) {
    this.applyForce(this.force);
    super.update(delta);
  }

  override onKeyup(key: string): void {
    switch(key) {
      case 'd':
        this.force.x = this.force.x == this.speed ? 0 : this.force.x;
        break;
      case 'a':
        this.force.x = this.force.x == -this.speed ? 0 : this.force.x;
        break;
      case 'w':
        this.force.y = this.force.y == -this.speed ? 0 : this.force.y;
        break;
      case 's':
        this.force.y = this.force.y == this.speed ? 0 : this.force.y;
        break;
    }
  }

  override onKeydown(key: string): void {
    switch(key) {
      case 'd':
        this.force.x = this.speed;
        break;
      case 'a':
        this.force.x = -this.speed;
        break;
      case 'w':
        this.force.y = -this.speed;
        break;
      case 's':
        this.force.y = this.speed;
        break;
    }
  }
}
