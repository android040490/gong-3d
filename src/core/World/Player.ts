import * as THREE from "three";
// import Time from "../Utils/Time";
import Experience from "../Experience";
import Camera from "../Camera";
import World from "./World";
import PhysicalWorld from "../PhysicalWorld";
import PhysicalEntity from "../models/PhysicalEntity";
import { KinematicCharacterController } from "@dimforge/rapier3d";

export default class Player {
  // private time: Time;
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
  // private velocity = new THREE.Vector3();
  // private direction = new THREE.Vector3();
  private height = 3; // player height

  constructor() {
    const experience = new Experience();
    // this.time = experience.time;
    this.camera = experience.camera;
    this.world = experience.world;
    this.physicalWorld = experience.physicalWorld;

    this.setPhysicalBody();
    this.setCharacterController();
    this.setListeners();
  }

  update() {
    const controls = this.camera.controls;
    // const delta = this.time.delta / 1000;

    if (controls.isLocked === true) {
      // this.velocity.x -= this.velocity.x * 10.0 * delta;
      // this.velocity.z -= this.velocity.z * 10.0 * delta;

      // this.velocity.y -= 9.8 * 70.0 * delta; // 100.0 = mass
      // this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      // this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      // this.direction.normalize(); // this ensures consistent movements in all directions

      // if (this.moveForward || this.moveBackward)
      //   this.velocity.z -= this.direction.z * 400.0 * delta;
      // if (this.moveLeft || this.moveRight)
      //   this.velocity.x -= this.direction.x * 400.0 * delta;

      // if (onObject === true) {
      //   this.velocity.y = Math.max(0, this.velocity.y);
      //   canJump = true;
      // }

      // controls.moveRight(-this.velocity.x * delta);
      // controls.moveForward(-this.velocity.z * delta);

      // controls.object.position.y += this.velocity.y * delta; // new behavior

      // if (controls.object.position.y < this.height) {
      //   this.velocity.y = 0;
      //   controls.object.position.y = this.height;

      //   this.canJump = true;
      // }

      let movement = new THREE.Vector3();

      if (this.moveForward) {
        movement.z -= 1;
      }
      if (this.moveBackward) {
        movement.z += 1;
      }
      if (this.moveLeft) {
        movement.x -= 1;
      }
      if (this.moveRight) {
        movement.x += 1;
      }

      movement
        .normalize()
        .applyQuaternion(this.camera.instance.quaternion)
        .multiplyScalar(0.3); // The movement we would like to apply if there wasn’t any obstacle.

      this.characterController.computeColliderMovement(
        this.body.collider,
        { x: movement.x, y: 0, z: movement.z }, // The collider we would like to move.
      );

      // console.log(this.characterController.computedGrounded());
      // Read the result.
      let correctedMovement = this.characterController.computedMovement();

      const newPosition = new THREE.Vector3()
        .copy(this.body.rigidBody.translation())
        .add(correctedMovement);

      this.body.rigidBody.setTranslation(
        {
          x: newPosition.x,
          y: newPosition.y,
          z: newPosition.z,
        },
        true,
      );
      this.camera.instance.position.set(
        newPosition.x,
        newPosition.y + 1,
        newPosition.z,
      );

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
          // this.velocity.y += 550;
          this.body.rigidBody.applyImpulse(
            {
              x: 0,
              y: 2000,
              z: 0,
            },
            true,
          );
        }
        // this.canJump = false; // TODO: turn on this logic and update the update method
        break;
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
