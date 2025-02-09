import * as THREE from "three";
import Time from "../Utils/Time";
import Experience from "../Experience";
import Camera from "../Camera";
import World from "./World";
import PhysicalWorld from "../PhysicalWorld";
import PhysicalEntity from "../models/PhysicalEntity";
import { KinematicCharacterController } from "@dimforge/rapier3d";

export default class Player {
  private time: Time;
  private camera: Camera;
  private world: World;
  private physicalWorld: PhysicalWorld;
  private characterController!: KinematicCharacterController;
  private body!: PhysicalEntity;
  private moveForward = false;
  private moveLeft = false;
  private moveBackward = false;
  private moveRight = false;
  private canJump = true;
  private height = 3; // player height
  private velocity = new THREE.Vector3();
  private speed = 1;

  constructor() {
    const experience = new Experience();
    this.time = experience.time;
    this.camera = experience.camera;
    this.world = experience.world;
    this.physicalWorld = experience.physicalWorld;

    this.setPhysicalBody();
    this.setCharacterController();
    this.setListeners();
  }

  update() {
    const controls = this.camera.controls;
    const delta = this.time.delta / 1000;

    if (controls.isLocked === true) {
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      // this.velocity.x =
      //   Math.abs(this.velocity.x) < 0.000001 ? 0 : this.velocity.x;
      // this.velocity.z =
      //   Math.abs(this.velocity.z) < 0.000001 ? 0 : this.velocity.z;

      const direction = new THREE.Vector3();

      direction.z = Number(this.moveBackward) - Number(this.moveForward);
      direction.x = Number(this.moveRight) - Number(this.moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (this.moveForward || this.moveBackward) {
        this.velocity.z += direction.z * 2 * delta * this.speed;
      }

      if (this.moveLeft || this.moveRight) {
        this.velocity.x += direction.x * 2 * delta * this.speed;
      }

      const movement = this.velocity
        .clone()
        .normalize()
        .applyQuaternion(this.camera.instance.quaternion)
        .multiplyScalar(this.velocity.length());

      this.characterController.computeColliderMovement(
        this.body.collider,
        { x: movement.x, y: 0, z: movement.z }, // The collider we would like to move.
      );

      // Read the result.
      let correctedMovement = this.characterController.computedMovement();

      const prevPosition = new THREE.Vector3().copy(
        this.body.rigidBody.translation(),
      );

      const newPosition = prevPosition.add(correctedMovement);

      this.body.rigidBody.setTranslation(
        {
          x: newPosition.x,
          y: newPosition.y,
          z: newPosition.z,
        },
        true,
      );
      this.camera.controls.object.position.set(
        newPosition.x,
        newPosition.y + 1,
        newPosition.z,
      );

      const hit = this.physicalWorld.castRay(
        this.body.rigidBody.translation(),
        {
          x: 0.0,
          y: -1.5,
          z: 0.0,
        },
        1,
        true,
        undefined,
        undefined,
        this.body.collider,
      );

      if (hit?.collider) {
        this.canJump = true;
      }

      this.body.update();
    }
  }

  private setCharacterController(): void {
    let offset = 0.01;
    this.characterController =
      this.physicalWorld.instance.createCharacterController(offset);
    this.characterController.enableSnapToGround(0.5);
    this.characterController.setApplyImpulsesToDynamicBodies(true);
    this.characterController.setMinSlopeSlideAngle((10 * Math.PI) / 180);
  }

  private setPhysicalBody(): void {
    this.body = new PhysicalEntity({
      shape: { type: "box", sizes: { x: 1, y: this.height, z: 1 } },
      density: 100,
      rigidBodyType: "dynamic",
      position: { x: 10, y: this.height / 2, z: 5 },
      geometry: new THREE.BoxGeometry(1, this.height, 1),
      material: new THREE.MeshStandardMaterial({ color: "#00f" }),
    });
    this.body.rigidBody.lockRotations(true, true);
    this.body.rigidBody.setTranslation(this.camera.instance.position, true);
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

      case "ShiftLeft":
        this.speed = 1;
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
          this.body.rigidBody.applyImpulse(
            {
              x: 0,
              y: 2000,
              z: 0,
            },
            true,
          );
        }
        this.canJump = false;
        break;

      case "ShiftLeft":
        this.speed = 2;
    }
  }

  private throwObject(): void {
    const cameraDirection = this.camera.controls.getDirection(
      new THREE.Vector3(0, 0, 0),
    );
    const cameraPosition = this.camera.instance.position
      .clone()
      .add(cameraDirection.clone().normalize().multiplyScalar(2));

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
    randomObj.rigidBody.applyImpulse(cameraDirection, true);
    randomObj.rigidBody.setLinearDamping(0.2);

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
