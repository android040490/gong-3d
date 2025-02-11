import * as THREE from "three";
import Time from "../Utils/Time";
import Experience from "../Experience";
import Camera from "../Camera";
import World from "./World";
import PhysicalWorld from "../PhysicalWorld";
import PhysicalEntity from "../models/PhysicalEntity";
import { KinematicCharacterController } from "@dimforge/rapier3d";
import Hammer from "./Hammer";

export default class Player {
  private readonly minSpeed = 0.3;
  private readonly maxSpeed = 2;
  private _speed: number;
  private time: Time;
  private camera: Camera;
  private world: World;
  private physicalWorld: PhysicalWorld;
  private characterController!: KinematicCharacterController;
  private body!: PhysicalEntity;
  private hammer!: Hammer;
  private _moveForward = false;
  private _moveLeft = false;
  private _moveBackward = false;
  private _moveRight = false;
  private _canJump = true;
  private height = 3; // player height
  private velocity = new THREE.Vector3();

  constructor() {
    const experience = new Experience();
    this.time = experience.time;
    this.camera = experience.camera;
    this.world = experience.world;
    this.physicalWorld = experience.physicalWorld;

    this._speed = this.minSpeed;

    this.setPhysicalBody();
    this.addHummer();
    this.setCharacterController();
  }

  set moveForward(value: boolean) {
    this._moveForward = value;
  }

  set moveBackward(value: boolean) {
    this._moveBackward = value;
  }

  set moveLeft(value: boolean) {
    this._moveLeft = value;
  }

  set moveRight(value: boolean) {
    this._moveRight = value;
  }

  accelerate(value: boolean): void {
    this._speed = value ? this.maxSpeed : this.minSpeed;
  }

  jump(): void {
    if (this._canJump === true) {
      this.body.rigidBody.applyImpulse(
        {
          x: 0,
          y: 2000,
          z: 0,
        },
        true,
      );
    }
    this._canJump = false;
  }

  hit(): void {
    this.hammer.hit();
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

      direction.z = Number(this._moveBackward) - Number(this._moveForward);
      direction.x = Number(this._moveRight) - Number(this._moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (this._moveForward || this._moveBackward) {
        this.velocity.z += direction.z * 2 * delta * this._speed;
      }

      if (this._moveLeft || this._moveRight) {
        this.velocity.x += direction.x * 2 * delta * this._speed;
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

      const cameraDir = this.camera.instance.quaternion;
      this.body.rigidBody.setRotation(
        { x: 0, y: cameraDir.y, z: cameraDir.z, w: cameraDir.w },
        true,
      );
      this.camera.controls.object.position.set(
        newPosition.x,
        newPosition.y + 1,
        newPosition.z,
      );

      this.detectGround();

      this.body.update();
      this.hammer.update();
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
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, this.height, 1),
      new THREE.MeshStandardMaterial({
        color: "#00f",
        opacity: 0,
        transparent: true,
      }),
    );
    this.body = new PhysicalEntity({
      shape: { type: "box", sizes: { x: 1, y: this.height, z: 1 } },
      density: 100,
      rigidBodyType: "dynamic",
      position: { x: 10, y: this.height / 2, z: 5 },
      mesh,
    });
    this.body.rigidBody.lockRotations(true, true);
    this.body.rigidBody.setTranslation(this.camera.instance.position, true);
  }

  private addHummer(): void {
    this.hammer = new Hammer(this.body);
  }

  private detectGround(): void {
    const hit = this.physicalWorld.castRay(
      this.body.rigidBody.translation(),
      {
        x: 0.0,
        y: -this.height / 2 - 0.01,
        z: 0.0,
      },
      1,
      true,
      undefined,
      undefined,
      this.body.collider,
    );

    if (hit?.collider) {
      this._canJump = true;
    }
  }

  throwObject(): void {
    const cameraDirection = this.camera.instance.getWorldDirection(
      new THREE.Vector3(0, 0, 0),
    );
    const position = this.camera.instance.position
      .clone()
      .add(cameraDirection.clone().multiplyScalar(2));

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 5),
      new THREE.MeshStandardMaterial({ color: "#00f" }),
    );
    const randomObj = new PhysicalEntity({
      shape: { type: "box", sizes: { x: 5, y: 1, z: 5 } },
      density: 1000,
      // restitution: 1.7,
      rigidBodyType: "dynamic",
      position,
      mesh,
    });

    cameraDirection.multiplyScalar(200);
    randomObj.rigidBody.applyImpulse(cameraDirection, true);
    randomObj.rigidBody.setLinearDamping(0.2);

    this.world.addObject(randomObj);
  }
}
