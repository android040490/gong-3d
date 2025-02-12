import * as THREE from "three";
import GUI from "lil-gui";
import Experience from "../Experience";
import Debug from "../Utils/Debug";
import Time from "../Utils/Time";
import Resources from "../Utils/Resources";
import Sky from "./Sky";

export default class Environment {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly time: Time;
  private readonly debug: Debug;
  private readonly resources: Resources;
  private debugFolder?: GUI;
  private texture?: THREE.Texture;
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private sky!: Sky;
  private phi = THREE.MathUtils.degToRad(80);
  private theta = THREE.MathUtils.degToRad(50);

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    this.setLight();
    this.setSky();
    this.loadTexture().then(() => {
      this.setNightMap();

      if (this.debug.active) {
        this.setDebug();
      }
    });
  }

  private async loadTexture(): Promise<void> {
    this.texture = await this.resources.loadTexture(
      "textures/environment/stars_milky_way_8k.jpg",
    );
  }

  private setLight(): void {
    // directional light
    this.sunLight = new THREE.DirectionalLight("#ffffff", 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.left = -20;
    this.sunLight.shadow.camera.right = 20;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -20;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 200;
    // this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.08;
    // this.sunLight.position.set(3.5, 2, -1.25).multiplyScalar(100);
    // this.sunLight.shadow.camera.position.set(3.5, 2, -1.25).multiplyScalar(100);
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

  private setSky(): void {
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

    this.sky.material.transparent = true;

    this.scene.add(this.sky);
  }

  private setNightMap(): void {
    if (this.texture) {
      this.texture.colorSpace = THREE.SRGBColorSpace;
      this.texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = this.texture;
      this.scene.backgroundRotation = new THREE.Euler(0, 0, Math.PI * 0.5);
    }
  }

  update() {
    this.phi -= this.time.delta * Math.PI * 0.0000005;
    const sunCosine = Math.cos(this.phi);

    const sunPosition = new THREE.Vector3().setFromSphericalCoords(
      1,
      this.phi,
      this.theta,
    );
    this.sunLight.position.copy(sunPosition.clone().multiplyScalar(50));

    const sunLightIntensity = THREE.MathUtils.smoothstep(sunCosine, -0.2, 0.1);
    const skyOpacity = THREE.MathUtils.smoothstep(sunCosine, -0.5, 0.2);

    this.sunLight.intensity = 4 * sunLightIntensity;
    this.sky.material.uniforms.sunPosition.value = sunPosition;
    this.sky.material.uniforms.uOpacity.value = skyOpacity;
  }
}
