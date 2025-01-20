import { CanvasContextWithViewport } from '../services/canvas';

export class Vector {
  constructor(public x: number, public y: number) { }

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  multiply(other: Vector | number): Vector {
    if (other instanceof Vector)
      return new Vector(this.x * other.x, this.y * other.y);
    else
      return new Vector(this.x * other, this.y * other);
  }

  divide(other: number): Vector {
    return new Vector(this.x / other, this.y / other);
  }

  distanceTo(other: Vector): number {
    return Math.sqrt((this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y));
  }

  magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  isLessThanOrEqualTo(other: Vector): boolean {
    return this.magnitude() <= other.magnitude();
  }

  equals(other: Vector): boolean {
    return this.magnitude() == other.magnitude();
  }
}

export class Entity {
  public color: string = "black";
  public speed: number = 0.5;
  public pos: Vector;
  public screenPos: Vector = new Vector(0, 0);
  public collided: boolean = false;
  public isDead: boolean = false;
  public mass: number = 1;
  public velocity: Vector = new Vector(0, 0);
  public acceleration: Vector = new Vector(0, 0);

  static size = 25;

  constructor(x: number = 0, y: number = 0) {
    this.pos = new Vector(x, y);
  }

  get x(): number { return this.pos.x; }
  get y(): number { return this.pos.y; }
  get size(): number { return Entity.size; }

  draw(ctx: CanvasContextWithViewport) {
    this.screenPos = new Vector(this.x - ctx.xView, this.y - ctx.yView);
    ctx.strokeStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x - ctx.xView, this.y - ctx.yView, this.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }

  update(delta: number) {
    if (this.isDead)
      return;
    this.pos = this.pos.add(this.velocity.multiply(delta));

    this.velocity = this.velocity.multiply(0.9).add(this.acceleration.multiply(delta));
    this.acceleration = this.acceleration.multiply(0);

    this.borderCollision();
  }

  applyForce(force: Vector) {
    this.acceleration = this.acceleration.add(force.divide(this.mass));
  }

  isCollide(other: Entity): boolean {
    return this.pos.distanceTo(other.pos) <= this.size + other.size;
  }

  borderCollision() {
    const nextPos = this.pos.add(this.velocity);
    if (nextPos.x < 0)
      this.velocity.x = 0;
    if (nextPos.y < 0)
      this.velocity.y = 0;
  }

  resolveCollision(other: Entity): void {
    const collision = other.pos.subtract(this.pos);
    const distance = other.pos.distanceTo(this.pos);
    const collisionNorm = collision.divide(distance);
    const relativeVelocity = this.velocity.subtract(other.velocity);
    let speed = relativeVelocity.x * collisionNorm.x + relativeVelocity.y * collisionNorm.y;

    if (isNaN(collisionNorm.x) || isNaN(collisionNorm.y))
      return;
    this.applyForce(collisionNorm.multiply(-1));
    other.applyForce(collisionNorm.multiply(1));

    const overlap = (this.size + other.size) - distance;
    other.pos.x += collisionNorm.x * overlap * 0.5;
    other.pos.y += collisionNorm.y * overlap * 0.5;
  }

  onKeydown(key: string): boolean { return false; }

  onKeyup(key: string): boolean { return false; }

  onClick(clickX: number, clickY: number) { }
}

export class HealthableEntity extends Entity {
  public health: number = 20;

  override update(delta: number): void {
    super.update(delta);
    if (this.health <= 0)
      this.isDead = true;
  }
}
