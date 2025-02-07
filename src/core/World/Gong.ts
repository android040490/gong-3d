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
  private plateColorTexture?: THREE.Texture;
  private plateNormalTexture?: THREE.Texture;
  private plateAmbientOcclusionTexture?: THREE.Texture;
  private plateMetallicTexture?: THREE.Texture;
  private plateRoughnessTexture?: THREE.Texture;
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
    const [
      baulkColorTexture,
      baulkNormalTexture,
      plateColorTexture,
      plateNormalTexture,
      plateMetallicTexture,
      plateRoughnessTexture,
      plateAmbientOcclusionTexture,
    ] = await this.resources.loadTextures([
      "textures/baulk/color.jpg",
      "textures/baulk/normal.jpg",
      "textures/gong-plate-2/color.jpg",
      "textures/gong-plate-2/normal.jpg",
      "textures/gong-plate-2/metallic.jpg",
      "textures/gong-plate-2/roughness.jpg",
      "textures/gong-plate-2/ambientOcclusion.jpg",
    ]);

    this.baulkColorTexture = baulkColorTexture;
    this.baulkNormalTexture = baulkNormalTexture;
    this.plateColorTexture = plateColorTexture;
    this.plateNormalTexture = plateNormalTexture;
    this.plateMetallicTexture = plateMetallicTexture;
    this.plateRoughnessTexture = plateRoughnessTexture;
    this.plateAmbientOcclusionTexture = plateAmbientOcclusionTexture;
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
    if (this.plateColorTexture) {
      this.plateColorTexture.colorSpace = THREE.SRGBColorSpace;
      this.plateColorTexture.repeat.set(2, 2);
      this.plateColorTexture.wrapS = THREE.RepeatWrapping;
      this.plateColorTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateNormalTexture) {
      this.plateNormalTexture.colorSpace = THREE.SRGBColorSpace;
      this.plateNormalTexture.repeat.set(2, 2);
      this.plateNormalTexture.wrapS = THREE.RepeatWrapping;
      this.plateNormalTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateRoughnessTexture) {
      this.plateRoughnessTexture.colorSpace = THREE.SRGBColorSpace;
      this.plateRoughnessTexture.repeat.set(2, 2);
      this.plateRoughnessTexture.wrapS = THREE.RepeatWrapping;
      this.plateRoughnessTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateMetallicTexture) {
      this.plateMetallicTexture.colorSpace = THREE.SRGBColorSpace;
      this.plateMetallicTexture.repeat.set(2, 2);
      this.plateMetallicTexture.wrapS = THREE.RepeatWrapping;
      this.plateMetallicTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateAmbientOcclusionTexture) {
      this.plateAmbientOcclusionTexture.colorSpace = THREE.SRGBColorSpace;
      this.plateAmbientOcclusionTexture.repeat.set(2, 2);
      this.plateAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
      this.plateAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
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
        geometry: new THREE.CylinderGeometry(0.2, 0.2, 10, 16),
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
      shape: { type: "cylinder", radius: 3, height: 0.2 },
      density: 30,
      rigidBodyType: "dynamic",
      position: { x: 0, y: 4.7, z: 0 },
      geometry: new THREE.CylinderGeometry(0, 3, 0.2, 64, 128, true),
      material: new THREE.MeshStandardMaterial({
        map: this.plateColorTexture,
        normalMap: this.plateNormalTexture,
        roughnessMap: this.plateRoughnessTexture,
        metalnessMap: this.plateMetallicTexture,
        aoMap: this.plateAmbientOcclusionTexture,
        roughness: 0.5,
        metalness: 0.5,
        side: THREE.DoubleSide,
      }),
      rotation: { x: 1, y: 0, z: 0, w: Math.PI / 2 },
    });

    const baulkRigidBody = this.children[2]?.rigidBody; // get baulk by index
    if (plate.rigidBody && baulkRigidBody) {
      let x = { x: 1, y: 0, z: 0 };
      const jointParams = this.physicalWorld.createRevoluteJointData(
        { x: 0, y: 3.3, z: 0 },
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
