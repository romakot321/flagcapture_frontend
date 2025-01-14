import { BaseUIModel } from './base';


export class Label extends BaseUIModel {
  constructor(x: number, y: number, private _text: string) {
    super(x, y);

    this.element.innerText = _text;
    this.element.style.fontSize = "2rem";
    this.element.style.color = "black";
  }

  set text(value: string) {
    this._text = value;
    this.element.innerText = value;
  }

  get text(): string {
    return this._text;
  }
}
