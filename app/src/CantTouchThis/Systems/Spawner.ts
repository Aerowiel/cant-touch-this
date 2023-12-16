import { Entity, System } from "~/src/CantTouchThis/GameEngine/ECS";
import {
  BallComponent,
  BonusComponent,
  BouncyComponent,
  ColorComponent,
  PlayerComponent,
  PositionComponent,
  RectColliderComponent,
  SizeComponent,
  VelocityComponent,
} from "../Components";

const BALL_SPEED = 12;
const BALL_COLORS: { [key: string]: [number, number, number] } = {
  normal: [255, 255, 255],
  deviant: [255, 0, 0],
};
const BALL_SIZE = 20;

const DEVIANT_BALL_SPAWN_RATIO = 4;
const DEVIANT_BALL_SPEED_FACTOR = 1.2;

const BALL_SPAWN_RATE = 3;

const SAFEZONE_SIZE = 200;

const BONUS_SIZE = 16;
const BONUS_SPAWN_RATE = BALL_SPAWN_RATE * 3;

export default class SpawnerSystem extends System {
  componentsRequired = new Set<Function>([
    PositionComponent,
    SizeComponent,
    PlayerComponent,
  ]);

  numberOfBalls: number = 0;
  nextBallSpawn: number = 0;
  nextBonusSpawn: number = BONUS_SPAWN_RATE * 1000;

  createBall(playerPosition, playerSize) {
    this.numberOfBalls += 1;

    const ball = this.ecs.addEntity();

    const { x: playerX, y: playerY } = playerPosition;
    const { width: playerWidth, height: playerHeight } = playerSize;

    const { x: ballX, y: ballY } = this.getXYOutsideSafezone({
      playerX,
      playerY,
      playerWidth,
      playerHeight,
    });

    const isDeviant =
      this.numberOfBalls !== 0 &&
      this.numberOfBalls % DEVIANT_BALL_SPAWN_RATIO === 0;

    const ballSpeed = isDeviant
      ? BALL_SPEED * DEVIANT_BALL_SPEED_FACTOR
      : BALL_SPEED;

    const velocity = new VelocityComponent(ballSpeed, ballSpeed);

    const [aimX, aimY] = isDeviant
      ? [
          this.ecs.getRandomBetween(0, this.ecs.canvas.width),
          this.ecs.getRandomBetween(0, this.ecs.canvas.height),
        ]
      : [playerX, playerY];

    const vx = aimX - ballX;
    const vy = aimY - ballY;

    const vectorLength = Math.sqrt(vx * vx + vy * vy);

    const normalized_vx = vx / vectorLength;
    const normalized_vy = vy / vectorLength;

    velocity.vx *= normalized_vx;
    velocity.vy *= normalized_vy;

    const position = new PositionComponent(ballX, ballY);

    const ballRGB: [number, number, number] = isDeviant
      ? BALL_COLORS.deviant
      : BALL_COLORS.normal;
    const color = new ColorComponent(...ballRGB);

    this.ecs.addComponent(ball, color);

    this.ecs.addComponent(ball, position);
    const size = new SizeComponent(BALL_SIZE, BALL_SIZE);
    this.ecs.addComponent(ball, size);
    this.ecs.addComponent(ball, new RectColliderComponent(position, size));
    this.ecs.addComponent(ball, velocity);
    this.ecs.addComponent(ball, new BallComponent());
    this.ecs.addComponent(ball, new BouncyComponent());

    return ball;
  }

  createBonus(playerPosition, playerSize, bonusType) {
    const bonus = this.ecs.addEntity();
    this.ecs.addComponent(
      bonus,
      new BonusComponent(BonusComponent.TYPES[bonusType])
    );

    const { x: playerX, y: playerY } = playerPosition;
    const { width: playerWidth, height: playerHeight } = playerSize;

    const { x: ballX, y: ballY } = this.getXYOutsideSafezone({
      playerX,
      playerY,
      playerWidth,
      playerHeight,
    });

    const position = new PositionComponent(ballX, ballY);

    this.ecs.addComponent(bonus, position);
    const size = new SizeComponent(BONUS_SIZE, BONUS_SIZE);
    this.ecs.addComponent(bonus, size);
    this.ecs.addComponent(bonus, new RectColliderComponent(position, size));

    return bonus;
  }

  update(entities: Set<Entity>): void {
    const [player] = entities;

    const playerComponents = this.ecs.getComponents(player);
    const playerPosition = playerComponents.get(PositionComponent);
    const { size: playerSize } = playerComponents.get(RectColliderComponent);

    if (this.ecs.timeMachine.elapsedTime >= this.nextBallSpawn) {
      this.createBall(playerPosition, playerSize);
      this.nextBallSpawn =
        this.ecs.timeMachine.elapsedTime + 1000 * BALL_SPAWN_RATE;
    }

    if (this.ecs.timeMachine.elapsedTime >= this.nextBonusSpawn) {
      const bonusTypes = Object.keys(BonusComponent.TYPES);
      const randomIndex = Math.round(
        this.ecs.getRandomBetween(0, bonusTypes.length - 1)
      );
      const bonusType = bonusTypes[randomIndex];
      this.createBonus(playerPosition, playerSize, bonusType);

      this.nextBonusSpawn =
        this.ecs.timeMachine.elapsedTime + 1000 * BONUS_SPAWN_RATE;
    }
  }

  getXYOutsideSafezone({ playerX, playerY, playerWidth, playerHeight }) {
    let x = this.ecs.getRandomBetween(0, this.ecs.canvas.width - BALL_SIZE);
    let y = this.ecs.getRandomBetween(0, this.ecs.canvas.height - BALL_SIZE);

    while (
      (x - playerX) * (x - playerX) + (y - playerY) * (y - playerY) <
      (playerWidth + SAFEZONE_SIZE) * (playerHeight + SAFEZONE_SIZE)
    ) {
      x = this.ecs.getRandomBetween(0, this.ecs.canvas.width - BALL_SIZE);
      y = this.ecs.getRandomBetween(0, this.ecs.canvas.height - BALL_SIZE);
    }

    return { x, y };
  }
}
