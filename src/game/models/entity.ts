export class Vector {
  constructor(public x: number, public y: number) { }

  add(other: Vector): Vector {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  multiply(other: Vector | number): Vector {
    if (other instanceof Vector) {
      this.x *= other.x;
      this.y *= other.y;
    } else {
      this.x *= other;
      this.y *= other;
    }
    return this;
  }

  distanceTo(other: Vector): number {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }
}

export class Entity {
  public size: number = 25;
  public color: string = "black";
  public speed: number = 0.5;
  public pos: Vector;
  protected velocity: Vector = new Vector(0, 0);
  protected acceleration: Vector = new Vector(0, 0);

  constructor(x: number = 0, y: number = 0) {
    this.pos = new Vector(x, y);
  }

  get x(): number { return this.pos.x; }
  get y(): number { return this.pos.y; }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }

  update(delta: number) {
    this.pos.add(this.velocity.multiply(delta));

    this.velocity.multiply(0.9);
    this.velocity.add(this.acceleration.multiply(delta));
    this.acceleration.multiply(0);
  }

  applyForce(force: Vector) {
    this.acceleration.add(force);
  }

  isCollide(other: Entity): boolean {
    return this.pos.distanceTo(other.pos) <= this.size + other.size;
  }

  resolveCollision(other: Entity): void { }

  onKeydown(key: string) { }

  onKeyup(key: string) { }
}
