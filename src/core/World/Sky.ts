import * as THREE from "three";

import vertexShader from "../shaders/sky/vertex.glsl";
import fragmentShader from "../shaders/sky/fragment.glsl";

export default class Sky extends THREE.Mesh<
  THREE.BoxGeometry,
  THREE.ShaderMaterial
> {
  public isSky: boolean;

  constructor() {
    const material = new THREE.ShaderMaterial({
      name: "SkyShader",
      uniforms: {
        turbidity: { value: 2 },
        rayleigh: { value: 1 },
        mieCoefficient: { value: 5e-3 },
        mieDirectionalG: { value: 0.8 },
        sunPosition: { value: new THREE.Vector3() },
        up: { value: new THREE.Vector3(0, 1, 0) },
        uOpacity: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
    });
    super(new THREE.BoxGeometry(1, 1, 1), material);
    this.isSky = true;
  }
}
