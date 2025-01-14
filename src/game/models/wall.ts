import { HealthableEntity } from './entity';


export class Wall extends HealthableEntity {
  override health: number = 20;
  override collided: boolean = true;
  override mass: number = 100000;
  override color: string = "brown";

  constructor(
    x: number = 0,
    y: number = 0,
    public ownerId: number,
  ) {
    super(x, y);
  }
}
