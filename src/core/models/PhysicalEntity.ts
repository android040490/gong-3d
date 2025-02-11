import * as THREE from "three";
import { Collider, RigidBody } from "@dimforge/rapier3d";
import Experience from "../Experience";
import PhysicalWorld, { PhysicalObjectParams } from "../PhysicalWorld";
import SceneObject, { SceneObjectParams } from "./SceneObject";

interface PhysicalEntityParams extends PhysicalObjectParams, SceneObjectParams {
  rotation?: { x: number; y: number; z: number; w: number };
}

export default class PhysicalEntity extends SceneObject {
  private physicalWorld: PhysicalWorld;
  public collider!: Collider;
  public rigidBody!: RigidBody;

  constructor(params: PhysicalEntityParams) {
    super(params);

    this.physicalWorld = new Experience().physicalWorld;

    this.init(params);
  }

  update() {
    const pos = this.collider.translation();
    this.mesh.position.set(pos.x, pos.y, pos.z);

    const rot = this.collider.rotation();
    this.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  }

  private init(params: PhysicalEntityParams): void {
    const { collider, rigidBody } = this.physicalWorld.createObject(params);

    if (params.rotation) {
      const { x, y, z, w } = params.rotation;
      const quaternion = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(x, y, z),
        w,
      );
      collider.setRotationWrtParent(quaternion);
    }

    this.collider = collider;
    this.rigidBody = rigidBody;
  }
}
