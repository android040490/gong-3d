import * as THREE from "three";
import GUI from "lil-gui";
import Experience from "../Experience";
import Debug from "../Utils/Debug";
import { Sky } from "three/addons/objects/Sky.js";
import Time from "../Utils/Time";

export default class Environment {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly time: Time;
  private readonly debug: Debug;

  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private sky!: Sky;
  private debugFolder?: GUI;
  private phi = THREE.MathUtils.degToRad(80);
  private theta = THREE.MathUtils.degToRad(120);

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    this.init();
  }

  private init(): void {
    this.setLight();
    this.setEnvironmentMap();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  private setLight(): void {
    // directional light
    this.sunLight = new THREE.DirectionalLight("#ffffff", 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3.5, 2, -1.25);
    this.scene.add(this.sunLight);
    // ambient light
    this.ambientLight = new THREE.AmbientLight("#ffffff", 0.05);
    this.scene.add(this.ambientLight);
  }

  private setDebug(): void {
    this.debugFolder = this.debug.ui?.addFolder("environment");

    this.debugFolder
      ?.add(this.sunLight, "intensity")
      .min(0)
      .max(10)
      .step(0.001)
      .name("sunLightIntensity");
    this.debugFolder
      ?.add(this.sunLight.position, "y")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightY");
    this.debugFolder
      ?.add(this.sunLight.position, "z")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightZ");
    this.debugFolder
      ?.add(this.sunLight.position, "x")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightX");
  }

  private setEnvironmentMap(): void {
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);

    const sunPosition = new THREE.Vector3().setFromSphericalCoords(
      1,
      this.phi,
      this.theta,
    );

    const uniforms = this.sky.material.uniforms;
    uniforms.sunPosition.value = sunPosition;
    uniforms.turbidity.value = 10;
    uniforms.rayleigh.value = 3;
    uniforms.mieCoefficient.value = 0.005;
    uniforms.mieDirectionalG.value = 0.7;

    this.scene.add(this.sky);
  }

  update() {
    this.phi -= this.time.delta * Math.PI * 0.000001;
    const threshold = Math.cos(this.phi);
    const isNight = threshold < 0; // TODO: this value can be broadcasted to another components

    let alpha = 1;
    if (isNight) {
      let coef = 1 - Math.abs(Math.cos(this.phi));

      alpha = Math.pow(coef, 16);
    }

    const sunPosition = new THREE.Vector3().setFromSphericalCoords(
      1,
      this.phi,
      this.theta,
    );
    this.sunLight.position.copy(sunPosition);
    this.sunLight.intensity = 4 * alpha;

    this.sky.material.uniforms.sunPosition.value = sunPosition;
  }
}
