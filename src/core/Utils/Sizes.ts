import eventsManager, { EventsManager } from "./EventsManager";

export enum SizesEvent {
  Resize = "sizes:resize",
}

export default class Sizes {
  private _width: number;
  private _height: number;
  private _pixelRatio: number;
  private readonly eventsManager: EventsManager = eventsManager;

  constructor() {
    // Setup
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Resize event
    window.addEventListener("resize", () => {
      this._width = window.innerWidth;
      this._height = window.innerHeight;
      this._pixelRatio = Math.min(window.devicePixelRatio, 2);

      this.eventsManager.emit(SizesEvent.Resize);
    });
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get pixelRatio(): number {
    return this._pixelRatio;
  }
}
