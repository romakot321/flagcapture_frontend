import { Entity } from './entity';
import { Player } from './player';

export class Zone extends Entity {
  public isCaptured: boolean = false;

  private captureProcent: number = 0;
  private lastCaptureAdd: number = 0;
  private captureCooldown: number = 25;

  private storage: number = 0;
  private lastStorageAdd: number = 0;
  private storageCooldown: number = 1000;

  override size: number = 50;

  override update(delta: number): void {
    super.update(delta);
    if (!this.isCaptured || (performance.now() - this.lastCaptureAdd) < this.storageCooldown)
      return;

    this.storage += 1;
    this.lastCaptureAdd = performance.now();
  }

  override resolveCollision(other: Entity): void {
    if (performance.now() - this.lastCaptureAdd < this.captureCooldown)
      return;
    if (!(other instanceof Player))
      return;
    if (!this.isCaptured) {
      this.captureProcent = Math.min(100, this.captureProcent + 1);
      this.color = `rgb(${this.captureProcent * 3.5}, 0, 0)`;
      this.lastCaptureAdd = performance.now();
      if (this.captureProcent >= 100) {
        this.isCaptured = true;
        this.color = `rgb(0, 255, 0)`;
      }
    } else {
      other.coins += this.storage;
      this.storage = 0;
    }
  }
}
