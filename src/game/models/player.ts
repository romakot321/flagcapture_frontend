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
