import * as THREE from "three";
import Experience from "./Experience";
import { PointerLockControls } from "three/addons/Addons.js";
import Sizes from "./Utils/Sizes";

export default class Camera {
  private readonly experience: Experience;
  private readonly sizes: Sizes;
  private readonly scene: THREE.Scene;
  private readonly canvas: HTMLCanvasElement;
  private _controls!: PointerLockControls;

  instance!: THREE.PerspectiveCamera;

  constructor() {
    this.experience = new Experience();

    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.setInstance();
    this.setControls();
  }

  resize(): void {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  get controls(): PointerLockControls {
    return this._controls;
  }

  // update(): void {
  //   this.controls.update();
  // }

  dispose(): void {
    this._controls.dispose();
  }

  private setInstance(): void {
    this.instance = new THREE.PerspectiveCamera(
      50,
      this.sizes.width / this.sizes.height,
      0.1,
      1000,
    );

    this.instance.position.set(0, 5, 30);
    this.instance.lookAt(0, 0, 0);
    this.scene.add(this.instance);
  }

  private setControls(): void {
    this._controls = new PointerLockControls(this.instance, this.canvas);
  }
}
