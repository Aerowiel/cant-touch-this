import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  BouncyComponent,
  RectColliderComponent,
  VelocityComponent,
} from "../Components";

export default class CollisionBounceSystem extends System {
  componentsRequired = new Set<Function>([
    RectColliderComponent,
    BouncyComponent,
    VelocityComponent,
  ]);

  update(entities: Set<Entity>): void {
    for (let entity of entities) {
      const components = this.ecs.getComponents(entity);
      const velocity = components.get(VelocityComponent);
      const collider = components.get(RectColliderComponent);
      const collisions = collider.collisions;

      if (collisions.size === 0) {
        continue;
      }

      for (let collidedEntity of collisions) {
        velocity.vx = -velocity.vx;
        velocity.vy = -velocity.vy;
        collisions.delete(collidedEntity);

        const collidedEntityComponents = this.ecs.getComponents(collidedEntity);
        const hasBouncyComponent =
          collidedEntityComponents.has(BouncyComponent);

        if (hasBouncyComponent) {
          const collidedEntityVelocity =
            collidedEntityComponents.get(VelocityComponent);
          const collidedEntityCollidor = collidedEntityComponents.get(
            RectColliderComponent
          );

          collidedEntityVelocity.vx = -collidedEntityVelocity.vx;
          collidedEntityVelocity.vy = -collidedEntityVelocity.vy;

          collidedEntityCollidor.collisions.delete(entity);
        }
      }
    }
  }
}
