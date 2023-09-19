import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  PlayerComponent,
  PositionComponent,
  SizeComponent,
} from "../Components";

export default class PlayerRenderer extends System {
  componentsRequired = new Set<Function>([
    PositionComponent,
    SizeComponent,
    PlayerComponent,
  ]);

  drawPlayer(position: PositionComponent, size: SizeComponent): void {
    this.ecs.canvas.context.fillStyle = "green";
    this.ecs.canvas.context.fillRect(
      position.x,
      position.y,
      size.width,
      size.height
    );
  }

  update(entities: Set<Entity>): void {
    /* We get the first entity, there should be only one player anyways... */
    const [player] = entities;

    const components = this.ecs.getComponents(player);
    const position = components.get(PositionComponent);
    const size = components.get(SizeComponent);

    this.drawPlayer(position, size);
  }
}
