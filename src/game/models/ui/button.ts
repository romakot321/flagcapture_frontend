import { BaseUIModel } from './base';

type onClickCallback = () => void;


export class Button extends BaseUIModel {
  static holdTime: number = 500;

  private holdTimer: number = 0;
  private progressElement: HTMLElement;
  private isHolding: boolean = false;
  private intervalId: number = 0;

  constructor(x: number, y: number, private _text: string, public onClick: onClickCallback | undefined = undefined) {
    super(x, y);

    this.element.innerText = _text;
    this.element.style.fontSize = "2rem";
    this.element.style.color = "black";
    this.element.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    this.element.style.borderRadius = "50%";
    this.element.style.width = "10vmax";
    this.element.style.height = "10vmax";
    this.element.style.textAlign = "center";
    this.element.style.lineHeight = "10vmax";

    this.progressElement = document.createElement("div");
    this.progressElement.style.fontSize = "2rem";
    this.progressElement.style.borderRadius = "50%";
    this.progressElement.style.backgroundColor = "rgba(0, 0, 60, 0.3)";
    this.progressElement.style.width = "0";
    this.progressElement.style.height = "0";
    this.progressElement.style.position = "absolute";
    this.element.appendChild(this.progressElement);

    this.element.addEventListener("mousedown", this.startClick.bind(this));
    this.element.addEventListener("mouseup", this.stopClick.bind(this));
    this.element.addEventListener("touchstart", this.startClick.bind(this));
    this.element.addEventListener("touchend", this.stopClick.bind(this));
  }

  set text(value: string) {
    this._text = value;
    this.element.innerText = value;
  }

  get text(): string {
    return this._text;
  }

  private hold() {
    if ((performance.now() - this.holdTimer) > Button.holdTime) {
      this.isHolding = false;
      this.holdTimer = 0;
      this.progressElement.style.width = "0";
      this.progressElement.style.height = "0";
      clearInterval(this.intervalId);
      if (this.onClick)
        this.onClick();
      return;
    }
    if (!this.isHolding)
      return;

    const buttonRect = this.element.getBoundingClientRect();
    const progress = Math.min(1, (performance.now() - this.holdTimer) / Button.holdTime);
    this.progressElement.style.width = buttonRect.width * progress + "px";
    this.progressElement.style.height = buttonRect.height * progress + "px";
    this.progressElement.style.left = buttonRect.width / 2 - buttonRect.width * progress / 2 + "px";
    this.progressElement.style.top = buttonRect.height / 2 - buttonRect.height * progress / 2 + "px";
  }

  private startClick(e: any) {
    this.isHolding = true;
    this.holdTimer = performance.now();
    this.intervalId = setInterval(this.hold.bind(this), 1);
  }

  private stopClick(e: any) {
    this.isHolding = false;
    this.holdTimer = 0;
    this.progressElement.style.width = "0";
    this.progressElement.style.height = "0";
    clearInterval(this.intervalId);
  }
}
