import Entity from "../models/Entity";
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

  addObject(object: Entity): void {
    this.objects.push(object);
  }

  private setup(): void {
    this.environment = new Environment();
    new Floor();

    this.objects = [new Gong()];
  }
}
