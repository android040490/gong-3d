import Camera from "../../core/Camera";
import Experience from "../../core/Experience";
import classes from "./style.module.css";

export class Blocker extends HTMLElement {
  static selector = "blocker-layer";

  private readonly camera: Camera;
  private rendered = false;

  constructor() {
    super();

    this.camera = new Experience().camera;
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  private render(): void {
    this.innerHTML = `
      <div id="cross" class="${classes.cross}">+</div>
      <div id="blocker" class="${classes.blocker}">
        <div id="instructions" class="${classes.instructions}">
          <p style="font-size: 36px">Click to play</p>
          <p>
            Move: WASD<br />
            Jump: SPACE<br />
            Run: SHIFT<br />
            Look: MOUSE<br />
          </p>
          <p>To unlock the mouse pointer, press Esc</p>
        </div>
      </div>
    `;

    this.setListeners();
  }

  private setListeners(): void {
    this.addEventListener("click", () => {
      this.camera.controls.lock();
    });

    this.camera.controls.addEventListener("lock", () => {
      if (this.blocker) {
        this.blocker.style.display = "none";
      }
      this.cross?.classList.add(classes.visible);
    });

    this.camera.controls.addEventListener("unlock", () => {
      if (this.blocker) {
        this.blocker.style.display = "block";
      }
      this.cross?.classList.remove(classes.visible);
    });
  }

  private get cross(): HTMLElement | null {
    return document.getElementById("cross");
  }

  private get blocker(): HTMLElement | null {
    return document.getElementById("blocker");
  }
}
