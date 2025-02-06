import * as THREE from "three";
import Entity from "../models/Entity";
import PhysicalEntity from "../models/PhysicalEntity";
import Resources from "../Utils/Resources";
import Experience from "../Experience";
import PhysicalWorld from "../PhysicalWorld";

export default class Gong extends Entity {
  private children: PhysicalEntity[] = [];
  private resources: Resources;
  private baulkColorTexture?: THREE.Texture;
  private baulkNormalTexture?: THREE.Texture;
  private physicalWorld: PhysicalWorld;

  constructor() {
    super();

    const experience = new Experience();
    this.resources = experience.resources;
    this.physicalWorld = experience.physicalWorld;

    this.loadTextures().then(() => {
      this.init();
    });
  }

  update(): void {
    this.children.forEach((child) => child.update());
  }

  private async loadTextures(): Promise<void> {
    const [baulkColorTexture, baulkNormalTexture] =
      await this.resources.loadTextures([
        "textures/baulk/color.jpg",
        "textures/baulk/normal.jpg",
      ]);

    this.baulkColorTexture = baulkColorTexture;
    this.baulkNormalTexture = baulkNormalTexture;
  }

  private init(): void {
    this.setTextures();
    this.createColumns();
    this.createPlate();
  }

  private setTextures(): void {
    if (this.baulkColorTexture) {
      this.baulkColorTexture.colorSpace = THREE.SRGBColorSpace;
      this.baulkColorTexture.repeat.set(1, 5);
      this.baulkColorTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.baulkNormalTexture) {
      this.baulkNormalTexture.wrapT = THREE.RepeatWrapping;
    }
  }

  private createColumns(): void {
    const columnsPositions = [
      { position: { x: -4, y: 5, z: 0 } },
      { position: { x: 4, y: 5, z: 0 } },
      {
        position: { x: 0, y: 10, z: 0 },
        rotation: { x: 0, y: 0, z: 1, w: Math.PI / 2 },
      },
    ];

    columnsPositions.forEach(({ position, rotation }) => {
      const column = new PhysicalEntity({
        shape: { type: "cylinder", radius: 0.2, height: 10 },
        rigidBodyType: "fixed",
        position,
        rotation,
        geometry: new THREE.CylinderGeometry(0.2, 0.2, 10, 32),
        material: new THREE.MeshStandardMaterial({
          map: this.baulkColorTexture,
          normalMap: this.baulkNormalTexture,
        }),
      });

      this.children.push(column);
    });
  }

  private createPlate(): void {
    const plate = new PhysicalEntity({
      shape: { type: "cylinder", radius: 1, height: 0.2 },
      density: 10,
      rigidBodyType: "dynamic",
      position: { x: 0, y: 8.7, z: 0 },
      geometry: new THREE.CylinderGeometry(1, 1, 0.2, 32),
      material: new THREE.MeshStandardMaterial({
        map: this.baulkColorTexture,
        normalMap: this.baulkNormalTexture,
      }),
      rotation: { x: 1, y: 0, z: 0, w: Math.PI / 2 },
    });

    const baulkRigidBody = this.children[2]?.rigidBody; // get baulk by index
    if (plate.rigidBody && baulkRigidBody) {
      let x = { x: 1, y: 0, z: 0 };
      const jointParams = this.physicalWorld.createRevoluteJointData(
        { x: 0, y: 1.3, z: 0 },
        { x: 0, y: 0, z: 0 },
        x,
      );

      this.physicalWorld.instance.createImpulseJoint(
        jointParams,
        plate.rigidBody,
        baulkRigidBody,
        true,
      );
    }

    this.children.push(plate);
  }
}
