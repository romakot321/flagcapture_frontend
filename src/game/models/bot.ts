import { HealthableEntity, Entity, Vector } from './entity';
import { Player } from './player'
import { EntityRepository } from '../repositories';

export enum BotStatus {
  attack = 0,
  follow,
  defend,
  idle
}

export class EntityWithVision extends Entity {
  private visionRange: number = 200;

  constructor(
      x: number = 0,
      y: number = 0,
      private entityRepository: EntityRepository
  ) {
    super(x, y);
  }

  listVisibleEntities(): Entity[] {
    let entities: Entity[] = [];
    for (const entity of this.entityRepository.listCollided()) {
      if (entity === this)
        continue;
      if (entity.pos.distanceTo(this.pos) <= this.visionRange)
        entities.push(entity)
    }
    return entities;
  }

  getNearestBot(excludeOwnerId: number): Bot | null {
    let bots: Bot[] = this.listVisibleEntities().filter(el => el instanceof Bot && el.ownerId != excludeOwnerId) as Bot[];
    if (bots.length == 0)
      return null;

    let nearestBot = bots.reduce((min, bot) => {
      return bot.pos.distanceTo(this.pos) < min.pos.distanceTo(this.pos) ? bot : min;
    });

    return nearestBot;
  }
}

export class Bot extends EntityWithVision {
  public status: BotStatus = BotStatus.idle;
  public damage: number = 1;
  public _health: number = 20;

  private lastDamageDeal: number = 0;
  static damageDealCooldown: number = 200;
  static override size = 10;

  override collided: boolean = true;
  override get size(): number { return Bot.size; }

  constructor(
    x: number = 0,
    y: number = 0,
    entityRepository: EntityRepository,
    public ownerId: number,
    private followTo: Entity | undefined = undefined
  ) {
    super(x, y, entityRepository);
  }

  get health(): number { return this._health; }
  set health(value: number) {
    if (value < this._health) {
      if (this.status == BotStatus.idle || this.status == BotStatus.follow) {
        let nearestBot = this.getNearestBot(this.ownerId);
        if (nearestBot != null)
          this.attack(nearestBot);
      }
    }
    this._health = value;
  }

  private getFollowVector(): Vector {
    if (!this.followTo)
      return new Vector(0, 0);

    const distance = this.pos.distanceTo(this.followTo.pos);
    if (distance <= this.size * 4 + this.followTo.size * 3)
      return new Vector(0, 0);

    const nx = (this.pos.x - this.followTo.pos.x) / distance;
    const ny = (this.pos.y - this.followTo.pos.y) / distance;

    return new Vector(-nx * this.speed, -ny * this.speed);
  }

  private getAttackVector(): Vector {
    if (!this.followTo)
      return new Vector(0, 0);

    const distance = this.pos.distanceTo(this.followTo.pos);
    const nx = (this.pos.x - this.followTo.pos.x) / distance;
    const ny = (this.pos.y - this.followTo.pos.y) / distance;
    return new Vector(-nx * this.speed, -ny * this.speed);
  }

  private getDefendVector(): Vector {
    if (!this.followTo)
      return new Vector(0, 0);

    let bots: Bot[] = this.listVisibleEntities().filter(el => el instanceof Bot && el.ownerId != this.ownerId) as Bot[];
    if (bots.length == 0)
      return this.getFollowVector();

    let nearestBot = bots.reduce((min, bot) => {
      return this.followTo && bot.pos.distanceTo(this.followTo.pos) < min.pos.distanceTo(this.followTo.pos) ? bot : min;
    });
    const distance = this.pos.distanceTo(nearestBot.pos);
    const nx = (this.pos.x - nearestBot.pos.x) / distance;
    const ny = (this.pos.y - nearestBot.pos.y) / distance;

    return new Vector(-nx * this.speed, -ny * this.speed);
  }

  private doTask() {
    if (!this.followTo)
      return;
    if (this.followTo.isDead) {
      this.followTo = undefined;
      return;
    }

    switch(this.status) {
      case BotStatus.follow:
        this.acceleration = this.getFollowVector();
        break;
      case BotStatus.attack:
        this.acceleration = this.getAttackVector();
        break;
      case BotStatus.defend:
        this.acceleration = this.getDefendVector();
        break;
    }
  }

  private dealDamage(other: HealthableEntity): void {
    if (
        performance.now() - this.lastDamageDeal >= Bot.damageDealCooldown
    ) {
      other.health -= this.damage;
      this.lastDamageDeal = performance.now();
    }
  }

  override update(delta: number) {
    super.update(delta);
    if (this._health <= 0)
      this.isDead = true;
    if (this.followTo)
      this.doTask();
  }

  override resolveCollision(other: Entity): void {
    if (other instanceof Bot || other instanceof Player)
      super.resolveCollision(other);
    if ('ownerId' in other && other.ownerId === this.ownerId)
      return;
    if ('health' in other)
      this.dealDamage(other as HealthableEntity);
  }

  attack(model: Entity): void {
    this.status = BotStatus.attack;
    this.followTo = model;
    this.color = "red";
  }

  follow(model: Entity): void {
    this.status = BotStatus.follow;
    this.followTo = model;
    this.color = "black";
  }

  defend(model: Entity): void {
    this.status = BotStatus.defend;
    this.followTo = model;
    this.color = "blue";
  }
}
