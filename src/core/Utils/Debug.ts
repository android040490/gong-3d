import * as dat from "lil-gui";

export default class Debug {
  private _active = false;
  private readonly _ui?: dat.GUI;

  constructor() {
    this._active = window.location.hash === "#debug";

    if (this._active) {
      this._ui = new dat.GUI();
    }
  }

  get active(): boolean {
    return this._active;
  }

  get ui(): dat.GUI | undefined {
    return this._ui;
  }

  destroy(): void {
    this.ui?.destroy();
  }
}
