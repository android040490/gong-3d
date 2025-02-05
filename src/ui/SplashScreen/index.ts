import eventsManager, { EventsManager } from "../../core/Utils/EventsManager";
import { ResourcesEvent } from "../../core/Utils/Resources";
import { ProgressBar } from "../ProgressBar";
import classes from "./style.module.css";

export class SplashScreen extends HTMLElement {
  static selector = "splash-screen";

  private rendered = false;
  private loadingBar?: ProgressBar | null;
  private splashScreen?: HTMLElement | null;
  private readonly eventsManager: EventsManager = eventsManager;

  constructor() {
    super();

    this.setListeners();
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  private render(): void {
    this.innerHTML = `
      <div id="splash-screen" class="${classes.splashScreen}">
        <h1 id="progress-text" class="${classes.text}">Loading...</h1>
        <progress-bar></progress-bar>
      </div>
    `;

    this.loadingBar = document.querySelector("progress-bar");
    this.splashScreen = document.getElementById("splash-screen");
  }

  private setListeners(): void {
    this.eventsManager.on(ResourcesEvent.LoadingProgress, (progress) => {
      this.updateProgressBar(progress);
    });

    this.eventsManager.on(ResourcesEvent.Ready, () => {
      this.hide();
    });
  }

  private hide(): void {
    this.splashScreen?.classList.add(classes.hidden);

    setTimeout(() => {
      if (this.splashScreen) {
        this.splashScreen.style.display = "none";
      }
    }, 3000);

    setTimeout(() => {
      this.loadingBar?.hide();
    }, 800);
  }

  private updateProgressBar(progress: number): void {
    this.loadingBar?.setProgress(progress);

    const progressTextElement = document.getElementById("progress-text");
    if (progressTextElement) {
      progressTextElement.innerText = `Loading ${Math.floor(progress * 100)}%`;
    }
  }
}
