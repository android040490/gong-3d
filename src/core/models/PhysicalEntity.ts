import { Collider } from "@dimforge/rapier3d";
import Experience from "../Experience";
import PhysicalWorld, { PhysicalObjectParams } from "../PhysicalWorld";
import SceneObject, { SceneObjectParams } from "./SceneObject";

type PhysicalEntityParams = PhysicalObjectParams & SceneObjectParams;

export default class PhysicalEntity extends SceneObject {
  private physicalWorld: PhysicalWorld;
  private collider: Collider;

  constructor(params: PhysicalEntityParams) {
    super(params);

    this.physicalWorld = new Experience().physicalWorld;

    this.collider = this.physicalWorld.createObject(params);
  }

  update() {
    const pos = this.collider.translation();
    this.mesh.position.set(pos.x, pos.y, pos.z);

    const rot = this.collider.rotation();
    this.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  }
}
