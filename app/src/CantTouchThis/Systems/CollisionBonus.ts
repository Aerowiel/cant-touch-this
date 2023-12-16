import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  BallComponent,
  BonusComponent,
  HealthComponent,
  PlayerComponent,
  RectColliderComponent,
} from "../Components";

export default class CollisionBonusSystem extends System {
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

    for (let collidedEntity of playerCollisions) {
      const collidedEntityComponents = this.ecs.getComponents(collidedEntity);

      if (!collidedEntityComponents.has(BonusComponent)) continue;
      const bonus = collidedEntityComponents.get(BonusComponent);
      const bonusType = bonus.type;
      switch (bonusType) {
        case BonusComponent.TYPES.HEALTH: {
          const playerHealth = playerComponents.get(HealthComponent);
          if (playerHealth.health === playerHealth.maxHealth) {
            playerHealth.maxHealth += 1;
          }
          playerHealth.health += 1;

          break;
        }
        case BonusComponent.TYPES.DESTROY_ONE_FOURTH_BALLS: {
          const ballsMap = this.ecs.getEntitiesWithComponent(BallComponent);
          const balls = [...ballsMap.keys()];
          const halfBalls = balls.slice(
            0,
            Math.max(1, Math.ceil(balls.length / 4))
          );

          halfBalls.forEach((ball) => {
            this.ecs.removeEntity(ball);
          });

          break;
        }
      }

      // Remove collision from collisions on both entity
      playerCollisions.delete(collidedEntity);

      // Remove ball
      this.ecs.removeEntity(collidedEntity);
    }
  }
}
