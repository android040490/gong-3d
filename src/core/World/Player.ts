import * as THREE from "three";
import Time from "../Utils/Time";
import Experience from "../Experience";
import Camera from "../Camera";
import World from "./World";
import PhysicalEntity from "../models/PhysicalEntity";

export default class Player {
  private time: Time;
  private camera: Camera;
  private world: World;
  private raycaster: THREE.Raycaster;
  private moveForward = false;
  private moveLeft = false;
  private moveBackward = false;
  private moveRight = false;
  private canJump = false;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private height = 5; // player height

  constructor() {
    const experience = new Experience();
    this.time = experience.time;
    this.camera = experience.camera;
    this.world = experience.world;

    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10,
    );
    this.setListeners();
  }

  update() {
    const controls = this.camera.controls;
    const delta = this.time.delta / 1000;
    if (controls.isLocked === true) {
      this.raycaster.ray.origin.copy(controls.object.position);
      this.raycaster.ray.origin.y -= 10;

      // const intersections = this.raycaster.intersectObjects(objects);

      // const onObject = intersections.length > 0;

      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;

      this.velocity.y -= 9.8 * 70.0 * delta; // 100.0 = mass
      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize(); // this ensures consistent movements in all directions

      if (this.moveForward || this.moveBackward)
        this.velocity.z -= this.direction.z * 400.0 * delta;
      if (this.moveLeft || this.moveRight)
        this.velocity.x -= this.direction.x * 400.0 * delta;

      // if (onObject === true) {
      //   this.velocity.y = Math.max(0, this.velocity.y);
      //   canJump = true;
      // }

      controls.moveRight(-this.velocity.x * delta);
      controls.moveForward(-this.velocity.z * delta);

      controls.object.position.y += this.velocity.y * delta; // new behavior

      if (controls.object.position.y < this.height) {
        this.velocity.y = 0;
        controls.object.position.y = this.height;

        this.canJump = true;
      }
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        this.moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        this.moveRight = false;
        break;
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        this.moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        this.moveRight = true;
        break;

      case "Space":
        if (this.canJump === true) {
          this.velocity.y += 150;
        }
        this.canJump = false;
        break;
    }
  }

  private throwObject(): void {
    const cameraDirection = this.camera.controls.getDirection(
      new THREE.Vector3(0, 0, 0),
    );
    const cameraPosition = this.camera.instance.position.clone();

    const randomObj = new PhysicalEntity({
      shape: { type: "sphere", radius: 0.5 },
      density: 10,
      restitution: 1.7,
      rigidBodyType: "dynamic",
      position: cameraPosition,
      geometry: new THREE.SphereGeometry(0.5, 16, 16),
      material: new THREE.MeshStandardMaterial({ color: "#00f" }),
    });

    cameraDirection.multiplyScalar(2000);
    randomObj.rigidBody?.applyImpulse(cameraDirection, true);
    randomObj.rigidBody?.setLinearDamping(0.2);

    this.world.addObject(randomObj);
  }

  private setListeners(): void {
    document.addEventListener("keydown", (e: KeyboardEvent) =>
      this.onKeyDown(e),
    );
    document.addEventListener("keyup", (e: KeyboardEvent) => this.onKeyUp(e));
    document.addEventListener("click", () => {
      if (this.camera.controls.isLocked === true) this.throwObject();
    });
  }
}
