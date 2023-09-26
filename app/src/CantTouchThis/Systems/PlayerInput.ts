import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import { PlayerComponent, VelocityComponent } from "../Components";
import GameKey from "../Utils/GameKey";
import Keyboard from "../Utils/Keyboard";

export default class PlayerInputSystem extends System {
  componentsRequired = new Set<Function>([PlayerComponent, VelocityComponent]);

  update(entities: Set<Entity>): void {
    const [player] = entities;
    const components = this.ecs.getComponents(player);
    const velocity = components.get(VelocityComponent);

    velocity.vx = 0;
    velocity.vy = 0;

    if (
      this.ecs.keyboard.gameKeys.get(GameKey.up).isDown ||
      this.ecs.keyboard.gameKeys.get(GameKey.arrowUp).isDown
    ) {
      velocity.vy -= 8;
    }
    if (
      this.ecs.keyboard.gameKeys.get(GameKey.left).isDown ||
      this.ecs.keyboard.gameKeys.get(GameKey.arrowLeft).isDown
    ) {
      velocity.vx -= 8;
    }
    if (
      this.ecs.keyboard.gameKeys.get(GameKey.down).isDown ||
      this.ecs.keyboard.gameKeys.get(GameKey.arrowDown).isDown
    ) {
      velocity.vy += 8;
    }
    if (
      this.ecs.keyboard.gameKeys.get(GameKey.right).isDown ||
      this.ecs.keyboard.gameKeys.get(GameKey.arrowRight).isDown
    ) {
      velocity.vx += 8;
    }
  }
}
