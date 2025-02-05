import * as THREE from "three";
import Environment from "./Environment";
import Floor from "./Floor";
import PhysicalEntity from "../models/PhysicalEntity";

export default class World {
  private environment!: Environment;
  private objects: PhysicalEntity[] = [];

  constructor() {
    this.setup();
  }

  private setup(): void {
    this.environment = new Environment();
    new Floor();

    this.objects = [
      new PhysicalEntity({
        shape: { type: "box", sizes: { x: 1, y: 1, z: 1 } },
        density: 10,
        restitution: 1,
        rigidBodyType: "dynamic",
        position: { x: 0, y: 10, z: 0 },
        geometry: new THREE.BoxGeometry(1, 1, 1),
        material: new THREE.MeshStandardMaterial({ color: "#00f" }),
      }),
      new PhysicalEntity({
        shape: { type: "sphere", radius: 0.5 },
        density: 10,
        restitution: 1,
        rigidBodyType: "dynamic",
        position: { x: 0, y: 20, z: 0 },
        geometry: new THREE.SphereGeometry(0.5, 16, 16),
        material: new THREE.MeshStandardMaterial({ color: "#00f" }),
      }),
    ];
  }

  update(): void {
    this.environment.update();

    this.objects.forEach((object) => object.update());
  }
}
