export class CanvasService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(private canvasElementId: string) {
    console.log("Getting", canvasElementId);
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
  }

  start() { }

  newFrame(): CanvasRenderingContext2D {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this.ctx;
  }
}
