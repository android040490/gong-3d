const RAPIER = await import("@dimforge/rapier3d");
import {
  World,
  ColliderDesc,
  RigidBodyDesc,
  RigidBody,
  Collider,
  Vector,
  JointData,
  RayColliderHit,
  InteractionGroups,
  QueryFilterFlags,
  EventQueue,
} from "@dimforge/rapier3d";

interface BoxShape {
  type: "box";
  sizes: {
    x: number;
    y: number;
    z: number;
  };
}

interface CylinderShape {
  type: "cylinder";
  radius: number;
  height: number;
}

interface SphereShape {
  type: "sphere";
  radius: number;
}

interface ColliderParams {
  shape: BoxShape | SphereShape | CylinderShape;
  density?: number;
  restitution?: number;
}

type RigidBodyType =
  | "dynamic"
  | "fixed"
  | "kinematicVelocityBased"
  | "kinematicPositionBased";

interface RigidBodyParams {
  rigidBodyType: RigidBodyType;
  position?: {
    x: number;
    y: number;
    z: number;
  };
}

export type PhysicalObjectParams = RigidBodyParams & ColliderParams;

export default class PhysicalWorld {
  private _instance: World;
  private _eventQueue: EventQueue;

  constructor() {
    this._instance = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this._eventQueue = new RAPIER.EventQueue(true);
  }

  get instance(): World {
    return this._instance;
  }

  get eventQueue(): EventQueue {
    return this._eventQueue;
  }

  createObject(params: PhysicalObjectParams): {
    collider: Collider;
    rigidBody: RigidBody;
  } {
    const rigidBodyDesc = this.createRigidBodyDesc(params);
    const rigidBody = this._instance.createRigidBody(rigidBodyDesc);

    const collider: Collider = this._instance.createCollider(
      this.createColliderDesc(params),
      rigidBody,
    );
    // collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    return { collider, rigidBody };
  }

  createRevoluteJointData(
    anchor1: Vector,
    anchor2: Vector,
    axis: Vector,
  ): JointData {
    const jointParams = RAPIER.JointData.revolute(anchor1, anchor2, axis);

    return jointParams;
  }

  castRay(
    origin: Vector,
    direction: Vector,
    maxToi: number = 1,
    solid: boolean = true,
    filterFlags?: QueryFilterFlags,
    filterGroups?: InteractionGroups,
    filterExcludeCollider?: Collider,
    filterExcludeRigidBody?: RigidBody,
    filterPredicate?: (collider: Collider) => boolean,
  ): RayColliderHit | null {
    let ray = new RAPIER.Ray(origin, direction);

    return this._instance.castRay(
      ray,
      maxToi,
      solid,
      filterFlags,
      filterGroups,
      filterExcludeCollider,
      filterExcludeRigidBody,
      filterPredicate,
    );
  }

  update() {
    this._instance.step(this._eventQueue);
  }

  private createRigidBodyDesc(params: RigidBodyParams): RigidBodyDesc {
    const { position, rigidBodyType } = params;
    const { x, y, z } = position ?? { x: 0, y: 0, z: 0 };

    let bodyDesc: RigidBodyDesc;

    switch (rigidBodyType) {
      case "dynamic":
        bodyDesc = RAPIER.RigidBodyDesc.dynamic();
        break;

      case "fixed":
        bodyDesc = RAPIER.RigidBodyDesc.fixed();
        break;

      case "kinematicPositionBased":
        bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;

      case "kinematicVelocityBased":
        bodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
        break;
    }

    bodyDesc.setTranslation(x, y, z);

    bodyDesc.setCcdEnabled(true);

    return bodyDesc;
  }

  private createColliderDesc(params: ColliderParams): ColliderDesc {
    const { shape, density, restitution } = params;
    let colliderDesc: ColliderDesc;

    switch (shape.type) {
      case "box":
        const { x, y, z } = shape.sizes;
        colliderDesc = RAPIER.ColliderDesc.cuboid(x / 2, y / 2, z / 2);
        break;

      case "sphere":
        colliderDesc = RAPIER.ColliderDesc.ball(shape.radius);
        break;

      case "cylinder":
        colliderDesc = RAPIER.ColliderDesc.cylinder(
          shape.height / 2,
          shape.radius,
        );
        break;
    }

    if (density) {
      colliderDesc.setDensity(density);
    }
    if (restitution) {
      colliderDesc.setRestitution(restitution);
    }

    return colliderDesc;
  }
}
