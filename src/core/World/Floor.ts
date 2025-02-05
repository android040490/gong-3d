import * as THREE from "three";
import Experience from "../Experience.js";
import Resources from "../Utils/Resources.js";

export default class Floor {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly resources: Resources;
  private readonly size = 100;

  private geometry?: THREE.BufferGeometry;
  private grassColorTexture?: THREE.Texture;
  private grassNormalTexture?: THREE.Texture;
  private material?: THREE.Material;
  private mesh?: THREE.Mesh;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.setPhysicalBody();

    this.loadTextures().then(() => {
      this.init();
    });
  }

  private setPhysicalBody(): void {
    this.experience.physicalWorld
      .createObject({
        shape: { type: "cylinder", radius: this.size, height: 0.5 },
        position: { x: 0, y: -0.5, z: 0 },
      })
      .setTranslation({ x: 0, y: -0.25, z: 0 });
  }

  private init(): void {
    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }

  private async loadTextures(): Promise<void> {
    const [grassColorTexture, grassNormalTexture] =
      await this.resources.loadTextures([
        "textures/floor/color.jpg",
        "textures/floor/normal.jpg",
      ]);

    this.grassColorTexture = grassColorTexture;
    this.grassNormalTexture = grassNormalTexture;
  }

  private setGeometry(): void {
    this.geometry = new THREE.CircleGeometry(this.size, 64);
  }

  private setTextures(): void {
    if (this.grassColorTexture) {
      this.grassColorTexture.colorSpace = THREE.SRGBColorSpace;
      this.grassColorTexture.repeat.set(10, 10);
      this.grassColorTexture.wrapS = THREE.RepeatWrapping;
      this.grassColorTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.grassNormalTexture) {
      this.grassNormalTexture.repeat.set(10, 10);
      this.grassNormalTexture.wrapS = THREE.RepeatWrapping;
      this.grassNormalTexture.wrapT = THREE.RepeatWrapping;
    }
  }

  private setMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      map: this.grassColorTexture,
      normalMap: this.grassNormalTexture,
    });
  }

  private setMesh(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * 0.5;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }
}
