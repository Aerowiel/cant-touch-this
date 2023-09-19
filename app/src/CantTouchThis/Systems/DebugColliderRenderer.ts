import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import { RectColliderComponent } from "../Components";

export default class DebugColliderRenderer extends System {
  componentsRequired = new Set<Function>([RectColliderComponent]);

  drawCollider(collider: RectColliderComponent): void {
    const position = collider.position;
    const size = collider.size;

    this.ecs.canvas.context.rect(
      position.x,
      position.y,
      size.width,
      size.height
    );
    this.ecs.canvas.context.lineWidth = 1;
    this.ecs.canvas.context.strokeStyle = "red";
    this.ecs.canvas.context.stroke();
  }

  update(entities: Set<Entity>): void {
    for (let entity of entities) {
      const components = this.ecs.getComponents(entity);
      const collider = components.get(RectColliderComponent);

      this.drawCollider(collider);
    }
  }
}
