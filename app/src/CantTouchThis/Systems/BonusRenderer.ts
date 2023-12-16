import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  BonusComponent,
  PositionComponent,
  SizeComponent,
} from "../Components";

export default class BonusRendererSystem extends System {
  componentsRequired = new Set<Function>([
    PositionComponent,
    SizeComponent,
    BonusComponent,
  ]);

  drawBonus(
    position: PositionComponent,
    size: SizeComponent,
    bonus: BonusComponent
  ): void {
    switch (bonus.type) {
      case BonusComponent.TYPES.HEALTH:
        this.ecs.canvas.context.fillStyle = "green";
        break;
      case BonusComponent.TYPES.DESTROY_ONE_FOURTH_BALLS:
        this.ecs.canvas.context.fillStyle = "pink";
        break;
      default:
        console.warn(`Unknown bonus type '${bonus.type}'`);
        return;
    }

    this.ecs.canvas.context.fillRect(
      position.x,
      position.y,
      size.width,
      size.height
    );
  }

  update(entities: Set<Entity>): void {
    for (let entity of entities) {
      const components = this.ecs.getComponents(entity);
      const position = components.get(PositionComponent);
      const size = components.get(SizeComponent);
      const bonus = components.get(BonusComponent);

      this.drawBonus(position, size, bonus);
    }
  }
}
