import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import { PlayerComponent, RectColliderComponent } from "../Components";

export default class CollisionSystem extends System {
  componentsRequired = new Set<Function>([RectColliderComponent]);

  colliding(
    collider1: RectColliderComponent,
    collider2: RectColliderComponent
  ) {
    const l1 = collider1.position;
    const r1 = {
      x: l1.x + collider1.size.width,
      y: l1.y + collider1.size.height,
    };

    const l2 = collider2.position;
    const r2 = {
      x: l2.x + collider2.size.width,
      y: l2.y + collider2.size.height,
    };

    if (l1.x > r2.x || l2.x > r1.x) {
      return false;
    }

    if (r1.y < l2.y || r2.y < l1.y) {
      return false;
    }

    return true;
  }

  update(entities: Set<Entity>): void {
    for (let currentEntity of entities) {
      const currentEntityComponents = this.ecs.getComponents(currentEntity);
      const currentEntityCollider = currentEntityComponents.get(
        RectColliderComponent
      );

      for (let entity of entities) {
        if (entity !== currentEntity) {
          const entityComponents = this.ecs.getComponents(entity);
          const entityCollider = entityComponents.get(RectColliderComponent);

          if (this.colliding(currentEntityCollider, entityCollider)) {
            currentEntityCollider.collisions.add(entity);
          }
        }
      }
    }
  }
}
