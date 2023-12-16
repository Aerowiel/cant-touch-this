import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  BallComponent,
  ColorComponent,
  PositionComponent,
  SizeComponent,
} from "../Components";

export default class BallRendererSystem extends System {
  componentsRequired = new Set<Function>([
    BallComponent,
    PositionComponent,
    SizeComponent,
  ]);

  drawBall(
    position: PositionComponent,
    size: SizeComponent,
    color?: ColorComponent
  ): void {
    if (color) {
      this.ecs.canvas.context.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
      this.ecs.canvas.context.strokeStyle = `rgb(${color.r},${color.g},${color.b})`;
    } else {
      this.ecs.canvas.context.fillStyle = "#000000";
      this.ecs.canvas.context.strokeStyle = "#000000";
    }

    this.ecs.canvas.context.beginPath();
    this.ecs.canvas.context.arc(
      position.x + size.width / 2,
      position.y + size.width / 2,
      size.width / 2,
      0,
      Math.PI * 2,
      true
    );
    this.ecs.canvas.context.closePath();
    this.ecs.canvas.context.fill();

    // draw center
    /*
    this.ecs.canvas.context.rect(
      position.x + size.width / 2,
      position.y + size.width / 2,
      1,
      1
    );
    this.ecs.canvas.context.lineWidth = 1;
    this.ecs.canvas.context.strokeStyle = "red";
    this.ecs.canvas.context.stroke();
    */
  }

  update(entities: Set<Entity>): void {
    for (let entity of entities) {
      const components = this.ecs.getComponents(entity);
      const position = components.get(PositionComponent);
      const size = components.get(SizeComponent);
      const color = components.get(ColorComponent);

      this.drawBall(position, size, color);
    }
  }
}
