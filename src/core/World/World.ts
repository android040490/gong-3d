import * as THREE from "three";
import Entity from "../models/Entity";
import PhysicalEntity from "../models/PhysicalEntity";
import Environment from "./Environment";
import Floor from "./Floor";

import Gong from "./Gong";

export default class World {
  private environment!: Environment;
  private objects: Entity[] = [];

  constructor() {
    this.setup();
  }

  update(): void {
    this.environment.update();

    this.objects.forEach((object) => object.update());
  }

  private setup(): void {
    this.environment = new Environment();
    new Floor();

    const randomObj = new PhysicalEntity({
      shape: { type: "sphere", radius: 0.5 },
      density: 10,
      restitution: 1,
      rigidBodyType: "dynamic",
      position: { x: 0, y: 9.5, z: 30 },
      geometry: new THREE.SphereGeometry(0.5, 16, 16),
      material: new THREE.MeshStandardMaterial({ color: "#00f" }),
    });
    this.objects = [new Gong(), randomObj];

    randomObj.rigidBody?.addForce({ x: 0, y: 0, z: -2000 }, true);
  }
}
