import { Entity } from './entity';
import { Player } from './player';
import { Bot } from './bot';

export class Zone extends Entity {
  public isCaptured: boolean = false;
  public ownerId: number | undefined = undefined;

  private _captureProcent: number = 0;
  private lastCaptureAdd: number = 0;
  private captureCooldown: number = 25;

  private storage: number = 0;
  private capacity: number = 5;
  private lastStorageAdd: number = 0;
  private storageCooldown: number = 1000;

  override collided: boolean = true;
  override mass: number = 100000;
  static override size = 50;


  constructor(
    x: number = 0,
    y: number = 0,
    ownerId: number | undefined = undefined,
  ) {
    super(x, y);
    if (ownerId)
      this.setOwner(ownerId);
  }

  set captureProcent(value: number) {
    value = Math.min(100, value);
    this._captureProcent = value;
    this.color = value < 100 ? `rgb(${this.captureProcent * 3.5}, 0, 0)` : "rgb(0, 255, 0)";
  }
  get captureProcent(): number { return this._captureProcent; }
  override get size(): number { return Zone.size; }

  private attacked(attacker: Bot): void {
    if (attacker.ownerId === this.ownerId || !this.isCaptured)
      return;
    super.resolveCollision(attacker);

    if (performance.now() - this.lastCaptureAdd < this.captureCooldown)
      return;

    this.captureProcent -= attacker.damage;
    this.lastCaptureAdd = performance.now();
    if (this.captureProcent <= 0) {
      this.isCaptured = false;
      this.ownerId = undefined;
7}
  }

  setOwner(ownerId: number) {
    this.captureProcent = 100;
    this.isCaptured = true;
    this.ownerId = ownerId;
  }

  override update(delta: number): void {
    super.update(delta);
    if (!this.isCaptured || (performance.now() - this.lastCaptureAdd) < this.storageCooldown || this.isDead)
      return;

    if (this.capacity) {
      this.storage += 1;
      this.capacity -= 1;
    }
    this.lastCaptureAdd = performance.now();
  }

  override resolveCollision(other: Entity): void {
    if (other instanceof Bot)
      return this.attacked(other);
    if (!(other instanceof Player))
      return;
    if (this.ownerId != undefined && other.id !== this.ownerId)
      return super.resolveCollision(other);
    if (performance.now() - this.lastCaptureAdd < this.captureCooldown || this.isDead)
      return;

    if (!this.isCaptured) {
      this.captureProcent = Math.min(100, this.captureProcent + 1);
      this.lastCaptureAdd = performance.now();
      if (this.captureProcent == 100) {
        this.isCaptured = true;
        this.ownerId = other.id;
      }
    } else {
      other.coins += this.storage;
      this.storage = 0;
      if (this.capacity <= 0 && this.storage <= 0)
        this.isDead = true;
    }
  }
}
