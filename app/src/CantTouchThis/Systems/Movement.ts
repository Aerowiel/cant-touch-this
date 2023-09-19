import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  PositionComponent,
  RectColliderComponent,
  SizeComponent,
  VelocityComponent,
} from "../Components";

export default class MovementSystem extends System {
  componentsRequired = new Set<Function>([
    PositionComponent,
    SizeComponent,
    VelocityComponent,
    RectColliderComponent,
  ]);

  update(entities: Set<Entity>): void {
    for (let entity of entities) {
      const components = this.ecs.getComponents(entity);
      const position = components.get(PositionComponent);
      const velocity = components.get(VelocityComponent);
      const collider = components.get(RectColliderComponent);
      const { width, height } = collider.size;

      let nextX = position.x + velocity.vx;
      if (nextX < 0) {
        nextX = 0;
      } else if (nextX + width > this.ecs.canvas.width) {
        nextX = this.ecs.canvas.width - width;
      }

      let nextY = position.y + velocity.vy;
      if (nextY < 0) {
        nextY = 0;
      } else if (nextY + height > this.ecs.canvas.height) {
        nextY = this.ecs.canvas.height - height;
      }

      position.x = nextX;
      position.y = nextY;
    }
  }
}
