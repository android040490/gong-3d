import * as THREE from "three";
import PhysicalEntity from "../models/PhysicalEntity";
import Experience from "../Experience";
import PhysicalWorld from "../PhysicalWorld";
import { RevoluteImpulseJoint } from "@dimforge/rapier3d";
import Resources from "../Utils/Resources";

export default class Hammer {
  private hammerHeadColorTexture?: THREE.Texture;
  private hammerHeadNormalTexture?: THREE.Texture;
  private hammerHeadRoughnessTexture?: THREE.Texture;
  private hammerHandleColorTexture?: THREE.Texture;
  private hammerHandleNormalTexture?: THREE.Texture;
  private hammerHandleRoughnessTexture?: THREE.Texture;
  private resources: Resources;
  private parent: PhysicalEntity;
  private minAngle = (-60 * Math.PI) / 180;
  private maxAngle = (40 * Math.PI) / 180;
  private joint!: RevoluteImpulseJoint;
  private object!: PhysicalEntity;

  protected physicalWorld: PhysicalWorld;

  constructor(parent: PhysicalEntity) {
    const experience = new Experience();
    this.physicalWorld = experience.physicalWorld;
    this.resources = experience.resources;

    this.parent = parent;

    this.loadTextures().then(() => {
      this.setTextures();
      this.setPhysicalObject();
      this.setJoint();
    });
  }

  update(): void {
    this.object.update();
  }

  hit(): void {
    this.joint.configureMotorPosition(this.minAngle, 950.0, 20);
    setTimeout(() => {
      this.joint.configureMotorPosition(this.maxAngle, 250.0, 80);
    }, 150);
  }

  private setPhysicalObject(): void {
    const bodyPosition = this.parent.rigidBody.translation();
    const hammerHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.5),
      new THREE.MeshStandardMaterial({
        map: this.hammerHandleColorTexture,
        normalMap: this.hammerHandleNormalTexture,
        roughnessMap: this.hammerHandleRoughnessTexture,
      }),
    );
    const hammerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({
        map: this.hammerHeadColorTexture,
        normalMap: this.hammerHeadNormalTexture,
        roughnessMap: this.hammerHeadRoughnessTexture,
      }),
    );
    hammerHandle.add(hammerHead);
    hammerHead.position.set(0, 0.6, 0);

    this.object = new PhysicalEntity({
      shape: { type: "cylinder", radius: 0.05, height: 1.5 },
      density: 200,
      rigidBodyType: "dynamic",
      position: {
        x: bodyPosition.x,
        y: bodyPosition.y / 2,
        z: bodyPosition.z - 1.8,
      },
      mesh: hammerHandle,
    });
  }

  private setJoint(): void {
    let x = { x: 1, y: 0, z: 0 };
    const jointParams = this.physicalWorld.createRevoluteJointData(
      { x: 0.2, y: 0.4, z: -1.7 },
      { x: 0, y: -0.6, z: 0 },
      x,
    );

    this.joint = this.physicalWorld.instance.createImpulseJoint(
      jointParams,
      this.parent.rigidBody,
      this.object.rigidBody,
      true,
    ) as RevoluteImpulseJoint;

    this.joint.setLimits(this.minAngle, this.maxAngle);
    this.joint.configureMotorPosition(this.maxAngle, 250.0, 20);
  }

  private async loadTextures(): Promise<void> {
    const result = await this.resources.loadTextures([
      "textures/hammer-head/color.jpg",
      "textures/hammer-head/normal.jpg",
      "textures/hammer-head/roughness.jpg",
      "textures/hammer-handle/color.jpg",
      "textures/hammer-handle/normal.jpg",
      "textures/hammer-handle/roughness.jpg",
    ]);

    this.hammerHeadColorTexture = result[0];
    this.hammerHeadNormalTexture = result[1];
    this.hammerHeadRoughnessTexture = result[2];
    this.hammerHandleColorTexture = result[3];
    this.hammerHandleNormalTexture = result[4];
    this.hammerHandleRoughnessTexture = result[5];
  }

  private setTextures(): void {
    if (this.hammerHandleColorTexture) {
      this.hammerHandleColorTexture.colorSpace = THREE.SRGBColorSpace;
    }

    if (this.hammerHeadColorTexture) {
      this.hammerHeadColorTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }
}
