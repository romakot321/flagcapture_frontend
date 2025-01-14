export class BaseUIModel {
  protected element: HTMLElement;

  constructor(public x: number, public y: number) {
    let el = document.createElement("div");

    el.style.position = "absolute";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.fontFamily = "sans-serif";
    el.style.zIndex = "2";

    this.element = el;
  }

  addToDOM(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }

  draw(ctx: CanvasRenderingContext2D) { }
}
