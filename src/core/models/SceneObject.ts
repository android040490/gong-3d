import * as THREE from "three";
import Experience from "../Experience";

export interface SceneObjectParams {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

export default class SceneObject {
  private readonly scene: THREE.Scene;
  private _mesh!: THREE.Mesh;
  private geometry: THREE.BufferGeometry;
  private material: THREE.Material;

  constructor(params: SceneObjectParams) {
    const { geometry, material } = params;
    this.geometry = geometry;
    this.material = material;

    this.scene = new Experience().scene;

    this.setMesh();
  }

  get mesh(): THREE.Mesh {
    return this._mesh;
  }

  private setMesh() {
    this._mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  }
}
