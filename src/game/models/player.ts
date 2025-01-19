import { Entity, Vector } from './entity';

type onCoinsChange = (value: number) => void;

export class Player extends Entity {
  public _coins: number = 0;
  public id: number;
  private force: Vector = new Vector(0, 0);

  override mass = 5;
  override speed = 2.5;

  constructor(
      private onCoinsChange: onCoinsChange | undefined = undefined,
      public name: string,
      x: number = 0,
      y: number = 0,
  ) {
    super(x, y);

    this.id = Math.floor(Math.random() * 1001);
  }

  get coins(): number { return this._coins; }
  set coins(value: number) {
    this._coins = value;
    if (this.onCoinsChange)
      this.onCoinsChange(value);
  }

  override update(delta: number) {
    super.update(delta);
    this.applyForce(this.force);
  }

  override onKeyup(key: string): boolean {
    switch(key) {
      case 'd':
        this.force.x = this.force.x == this.speed ? 0 : this.force.x;
        return true;
      case 'a':
        this.force.x = this.force.x == -this.speed ? 0 : this.force.x;
        return true;
      case 'w':
        this.force.y = this.force.y == -this.speed ? 0 : this.force.y;
        return true;
      case 's':
        this.force.y = this.force.y == this.speed ? 0 : this.force.y;
        return true;
    }
    return false;
  }

  override onKeydown(key: string): boolean {
    switch(key) {
      case 'd':
        this.force.x = this.speed;
        return true;
      case 'a':
        this.force.x = -this.speed;
        return true;
      case 'w':
        this.force.y = -this.speed;
        return true;
      case 's':
        this.force.y = this.speed;
        return true;
    }
    return false;
  }
}
