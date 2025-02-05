import * as THREE from "three";
import Experience from "./Experience";
import Sizes from "./Utils/Sizes";
import Camera from "./Camera";

export default class Renderer {
  private readonly experience: Experience;
  private readonly canvas: HTMLCanvasElement;
  private readonly sizes: Sizes;
  private readonly scene: THREE.Scene;
  private readonly camera: Camera;
  private readonly instance: THREE.WebGLRenderer;

  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    this.init();
  }

  resize(): void {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update(): void {
    this.instance.render(this.scene, this.camera.instance);
  }

  dispose(): void {
    this.instance.dispose();
  }

  private init(): void {
    // this.instance.toneMapping = THREE.CineonToneMapping;
    // this.instance.toneMappingExposure = 1.75;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.instance.setClearColor("#000011");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }
}
