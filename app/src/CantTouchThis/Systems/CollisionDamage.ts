import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  BallComponent,
  HealthComponent,
  PlayerComponent,
  RectColliderComponent,
} from "../Components";

export default class CollisionDamageSystem extends System {
  componentsRequired = new Set<Function>([
    RectColliderComponent,
    PlayerComponent,
    HealthComponent,
  ]);

  update(entities: Set<Entity>): void {
    if (!entities.size) return;
    const [player] = entities;

    const playerComponents = this.ecs.getComponents(player);
    const playerCollider = playerComponents.get(RectColliderComponent);
    const playerCollisions = playerCollider.collisions;

    if (playerCollisions.size === 0) {
      return;
    }

    const playerHealth = playerComponents.get(HealthComponent);

    for (let collidedEntity of playerCollisions) {
      const collidedEntityComponents = this.ecs.getComponents(collidedEntity);

      if (!collidedEntityComponents.has(BallComponent)) continue;
      // Remove collision from collisions on both entity
      playerCollisions.delete(collidedEntity);

      // Remove 1 hp from player health
      playerHealth.health -= 1;

      // Remove ball
      this.ecs.removeEntity(collidedEntity);
    }
  }
}
