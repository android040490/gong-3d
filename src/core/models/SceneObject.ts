import * as THREE from "three";
import Experience from "../Experience";

export type SceneObjectParams = {
  mesh: THREE.Mesh;
};

export default class SceneObject {
  private readonly scene: THREE.Scene;
  private _mesh: THREE.Mesh;

  constructor(params: SceneObjectParams) {
    const { mesh } = params;
    this._mesh = mesh;

    this.scene = new Experience().scene;

    this.setMesh();
  }

  get mesh(): THREE.Mesh {
    return this._mesh;
  }

  private setMesh() {
    this._mesh.castShadow = true;
    this.scene.add(this._mesh);
  }
}
