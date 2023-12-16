import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import { PlayerComponent, VelocityComponent } from "../Components";
import GameKey from "../Utils/GameKey";

export default class PlayerInputSystem extends System {
  componentsRequired = new Set<Function>([PlayerComponent, VelocityComponent]);

  update(entities: Set<Entity>): void {
    const [player] = entities;
    const components = this.ecs.getComponents(player);
    const velocity = components.get(VelocityComponent);

    velocity.vx = 0;
    velocity.vy = 0;

    const upIsDown =
      this.ecs.keyboard.gameKeys.get(GameKey.up).isDown ||
      this.ecs.keyboard.gameKeys.get(GameKey.arrowUp).isDown;
    const leftIsDown =
      this.ecs.keyboard.gameKeys.get(GameKey.left).isDown ||
      this.ecs.keyboard.gameKeys.get(GameKey.arrowLeft).isDown;
    const downIsDown =
      this.ecs.keyboard.gameKeys.get(GameKey.down).isDown ||
      this.ecs.keyboard.gameKeys.get(GameKey.arrowDown).isDown;
    const rightIsDown =
      this.ecs.keyboard.gameKeys.get(GameKey.right).isDown ||
      this.ecs.keyboard.gameKeys.get(GameKey.arrowRight).isDown;

    /* @TODO maybe refacto this */

    // up
    if (upIsDown) {
      velocity.vy -= 8;
    }
    // right
    if (rightIsDown) {
      velocity.vx += 8;
    }
    // down
    if (downIsDown) {
      velocity.vy += 8;
    }
    // left
    if (leftIsDown) {
      velocity.vx -= 8;
    }

    const velocityAdjustement = 8 - Math.sqrt(Math.pow(8, 2) / 2);

    /* adjust diagonal movements */
    // up + right
    if (upIsDown && rightIsDown) {
      velocity.vy += velocityAdjustement;
      velocity.vx -= velocityAdjustement;
    }
    // up + left
    if (upIsDown && leftIsDown) {
      velocity.vy += velocityAdjustement;
      velocity.vx += velocityAdjustement;
    }

    // down + right
    if (downIsDown && rightIsDown) {
      velocity.vy -= velocityAdjustement;
      velocity.vx -= velocityAdjustement;
    }

    // down + left
    if (downIsDown && leftIsDown) {
      velocity.vy -= velocityAdjustement;
      velocity.vx += velocityAdjustement;
    }
  }
}
