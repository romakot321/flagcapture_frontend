import { Label, Button, Joystick, Entity } from '../models';


export class CanvasContextWithViewport {
  private followTo: Entity | null = null;
  private widthView = window.innerWidth;
  private heightView = window.innerHeight;
  private camera: {x: number, y: number} = {x: 0, y: 0};
  public xView = 0;
  public yView = 0;
  public playerId: number = -1;

  constructor(private ctx: CanvasRenderingContext2D) { }

  set strokeStyle(value: string | CanvasGradient | CanvasPattern) { this.ctx.strokeStyle = value; }
  get strokeStyle(): string | CanvasGradient | CanvasPattern { return this.ctx.strokeStyle; }

  setFollowing(entity: Entity) {
    this.followTo = entity;
  }

  updateView() {
    if (!this.followTo)
      return;

    if (this.followTo.pos.x - this.camera.x + this.widthView / 2 > this.widthView)
      this.xView = this.followTo.pos.x - this.widthView / 2;
    else if (this.followTo.pos.x - this.widthView < this.xView)
      this.xView = this.followTo.pos.x - this.widthView / 2;

    if (this.followTo.pos.y - this.yView + this.heightView > this.heightView)
      this.yView = this.followTo.pos.y - this.heightView / 2;
    else if (this.followTo.pos.y - this.heightView < this.yView)
      this.yView = this.followTo.pos.y - this.heightView / 2;

    if (this.xView < 0)
      this.xView = 0;
    if (this.yView < 0)
      this.yView = 0;
  }

  clearRect(left: number, top: number, right: number, bottom: number) {
    this.ctx.clearRect(left, top, right, bottom);
  }

  beginPath() {
    this.ctx.beginPath();
  }

  arc(arg1: number, arg2: number, arg3: number, arg4: number, arg5: number) {
    this.ctx.arc(arg1, arg2, arg3, arg4, arg5);
  }

  stroke() {
    this.ctx.stroke();
  }

  closePath() {
    this.ctx.closePath();
  }
}


export class CanvasService {
  static cellSize: number = 50;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasContextWithViewport;
  private coinsLabel: Label;
  private botButton: Button;
  private wallButton: Button;
  private joystick: Joystick;

  constructor(
      private canvasElementId: string,
      private botButtonCallback: () => void,
      private wallButtonCallback: () => void,
  ) {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = new CanvasContextWithViewport(this.canvas.getContext("2d") as CanvasRenderingContext2D);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = "1";

    this.coinsLabel = new Label(10, 10, "Coins: 0");
    this.botButton = new Button(
      this.canvas.width / 100 * 10,
      this.canvas.height - this.canvas.height / 100 * 16,
      "B",
      botButtonCallback
    );
    this.wallButton = new Button(
      this.canvas.width - this.canvas.width / 100 * 20,
      this.canvas.height - this.canvas.height / 100 * 16,
      "W",
      wallButtonCallback
    );
    this.joystick = new Joystick(document.body);
  }

  getJoystickDirection(): {x: number, y: number} {
    return this.joystick.direction;
  }

  setCameraFollowTo(entity: Entity) {
    this.ctx.setFollowing(entity);
  }

  setPlayerId(playerId: number) {
    this.ctx.playerId = playerId;
  }

  start() {
    this.coinsLabel.addToDOM(document.body);
    this.botButton.addToDOM(document.body);
    this.wallButton.addToDOM(document.body);
  }

  newFrame(): CanvasContextWithViewport {
    this.ctx.updateView();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this.ctx;
  }

  onCoinsChange(value: number): void {
    this.coinsLabel.text = "Coins: " + value;
  }
}
