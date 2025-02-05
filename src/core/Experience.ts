import * as THREE from "three";
import Stats from "stats.js";
import Sizes, { SizesEvent } from "./Utils/Sizes";
import Time, { TimeEvent } from "./Utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import Resources from "./Utils/Resources";
import Debug from "./Utils/Debug";
import eventsManager, { EventsManager } from "./Utils/EventsManager";
import PhysicalWorld from "./PhysicalWorld";

let instance: Experience;

export default class Experience {
  public readonly canvas!: HTMLCanvasElement;
  public readonly debug!: Debug;
  public readonly sizes!: Sizes;
  public readonly time!: Time;
  public readonly scene!: THREE.Scene;
  public readonly resources!: Resources;
  public readonly camera!: Camera;
  public readonly renderer!: Renderer;
  public readonly world!: World;
  public readonly physicalWorld!: PhysicalWorld;
  private readonly eventsManager: EventsManager = eventsManager;

  private stats?: Stats;

  constructor() {
    if (instance) {
      return instance;
    }

    // window.experience = this;

    instance = this;
    // Options
    this.canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.physicalWorld = new PhysicalWorld();
    this.world = new World();

    // Sizes resize event
    this.eventsManager.on(SizesEvent.Resize, () => {
      this.resize();
    });

    // Time tick event
    this.eventsManager.on(TimeEvent.Tick, () => {
      this.update();
    });

    if (this.debug.active) {
      this.setDebug();
    }
  }

  destroy(): void {
    this.eventsManager.off(SizesEvent.Resize);
    this.eventsManager.off(TimeEvent.Tick);

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];

          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.dispose();
    this.renderer.dispose();

    if (this.debug.active) {
      this.debug.destroy();
    }
  }

  private resize(): void {
    this.camera.resize();
    this.renderer.resize();
  }

  private update(): void {
    if (this.debug.active) {
      this.stats?.begin();
    }
    this.physicalWorld.update();
    this.camera.update();
    this.world.update();
    this.renderer.update();
    if (this.debug.active) {
      this.stats?.end();
    }
  }

  private setDebug(): void {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
  }
}
