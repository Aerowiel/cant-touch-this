import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  BouncyComponent,
  RectColliderComponent,
  VelocityComponent,
} from "../Components";

export default class WallBounceSystem extends System {
  componentsRequired = new Set<Function>([
    BouncyComponent,
    RectColliderComponent,
    VelocityComponent,
  ]);

  update(entities: Set<Entity>): void {
    for (let entity of entities) {
      const components = this.ecs.getComponents(entity);
      const collider = components.get(RectColliderComponent);
      const position = collider.position;
      const size = collider.size;
      const velocity = components.get(VelocityComponent);

      if (position.x <= 0 || position.x + size.width >= this.ecs.canvas.width) {
        velocity.vx = -velocity.vx;
      }

      if (
        position.y <= 0 ||
        position.y + size.height >= this.ecs.canvas.height
      ) {
        velocity.vy = -velocity.vy;
      }
    }
  }
}
