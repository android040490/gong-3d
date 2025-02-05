import classes from "./style.module.css";

export class ProgressBar extends HTMLElement {
  static selector = "progress-bar";
  constructor() {
    super();

    this.classList.add(classes.loadingBar);
  }

  hide(): void {
    this.classList.add(classes.ended);
    this.style.transform = "";
  }

  setProgress(value: number) {
    this.style.transform = `scaleX(${value})`;
  }
}
