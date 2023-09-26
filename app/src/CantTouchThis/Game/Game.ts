import { v4 as uuidv4 } from "uuid";
import seedRandom from "seedrandom";

import ECS from "../GameEngine/ECS";
import Keyboard from "../Utils/Keyboard";
import TimeMachine from "../Utils/TimeMachine";
import GameHistory from "../Utils/GameHistory";
import {
  BallRendererSystem,
  CollisionDamageSystem,
  CollisionDetectorSystem,
  MovementSystem,
  PlayerInputSystem,
  PlayerRendererSystem,
  WallBounceSystem,
} from "../Systems";
import {
  BallComponent,
  BouncyComponent,
  ColorComponent,
  HealthComponent,
  PlayerComponent,
  PositionComponent,
  RectColliderComponent,
  SizeComponent,
  VelocityComponent,
} from "../Components";

const BALL_SPAWN_RATE = 4;
const BALL_SIZE = 20;

class Game {
  public ecs;
  public server;

  public seed;
  public random;

  public history;

  public player;
  public score;
  public started;

  public gameLoopRef;

  private callbacks;

  constructor({ seed = uuidv4(), canvas, callbacks, server = false }) {
    this.server = server;
    this.callbacks = callbacks;

    const keyboard = new Keyboard(server);
    const timeMachine = new TimeMachine();
    this.history = new GameHistory();

    this.ecs = new ECS(canvas, keyboard, timeMachine);

    const randomSeed = seed;
    this.seed = randomSeed;
    this.random = seedRandom(randomSeed);

    this.score = 0;

    this.initSystems();
    this.initPlayer();
  }

  initSystems() {
    this.ecs.addSystem(10, new PlayerInputSystem());
    this.ecs.addSystem(70, new CollisionDetectorSystem());
    this.ecs.addSystem(71, new CollisionDamageSystem());
    this.ecs.addSystem(80, new WallBounceSystem());
    this.ecs.addSystem(90, new MovementSystem());
    if (!this.server) {
      this.ecs.addSystem(100, new BallRendererSystem());
      this.ecs.addSystem(100, new PlayerRendererSystem());
    }
  }

  initPlayer() {
    const player = this.ecs.addEntity();
    this.ecs.addComponent(player, new PlayerComponent());

    const size = new SizeComponent(20, 20);
    this.ecs.addComponent(player, size);

    const position = new PositionComponent(
      this.ecs.canvas.width / 2,
      this.ecs.canvas.height / 2
    );
    this.ecs.addComponent(player, position);

    this.ecs.addComponent(player, new RectColliderComponent(position, size));
    this.ecs.addComponent(player, new VelocityComponent());
    this.ecs.addComponent(player, new HealthComponent(1));

    this.player = player;
  }

  start() {
    this.started = true;
    this.gameLoopRef = requestAnimationFrame((timeInMilliseconds) =>
      this.gameLoop(timeInMilliseconds, 0)
    );
  }

  end() {
    this.started = false;
    cancelAnimationFrame(this.gameLoopRef);
    if (typeof this.callbacks.onEndGame === "function") {
      this.callbacks.onEndGame(this);
    }
  }

  async clientReplay(snapshots) {
    return this.replay(snapshots, true);
  }

  serverReplay(snapshots) {
    this.replay(snapshots, false);
  }

  async replay(snapshots, isClient) {
    let previousTimeInMilliseconds = null;
    let nextBallSpawn = 0;

    for (const snapshot of snapshots) {
      const timeInMilliseconds = snapshot[0];
      const gameKeys = snapshot[1];

      this.ecs.keyboard.setKeys(gameKeys);

      const playerComponents = this.ecs.getComponents(this.player);
      const playerHealth = playerComponents?.get(HealthComponent);

      if (playerHealth?.value <= 0) {
        this.end();
        return;
      }

      this.updateScore();

      if (timeInMilliseconds >= nextBallSpawn) {
        const playerPosition = playerComponents.get(PositionComponent);
        const { size: playerSize } = playerComponents?.get(
          RectColliderComponent
        );

        this.createBall(playerPosition, playerSize);
        nextBallSpawn = timeInMilliseconds + 1000 * BALL_SPAWN_RATE;
      }

      this.ecs.update(timeInMilliseconds);

      if (isClient) {
        await new Promise((res) =>
          setTimeout(
            res,
            previousTimeInMilliseconds
              ? timeInMilliseconds - previousTimeInMilliseconds
              : 0
          )
        );
      }

      previousTimeInMilliseconds = timeInMilliseconds;
    }
  }

  gameLoop(timeInMilliseconds, nextBallSpawn) {
    this.history.update([timeInMilliseconds, this.ecs.keyboard.getKeys()]);

    const playerComponents = this.ecs.getComponents(this.player);
    const playerHealth = playerComponents.get(HealthComponent);

    if (playerHealth.value <= 0) {
      this.end();
      return;
    }

    this.updateScore();

    if (timeInMilliseconds >= nextBallSpawn) {
      const playerPosition = playerComponents.get(PositionComponent);
      const { size: playerSize } = playerComponents.get(RectColliderComponent);

      this.createBall(playerPosition, playerSize);
      nextBallSpawn = timeInMilliseconds + 1000 * BALL_SPAWN_RATE;
    }

    this.ecs.update(timeInMilliseconds);

    this.gameLoopRef = requestAnimationFrame((timeInMilliseconds) =>
      this.gameLoop(timeInMilliseconds, nextBallSpawn)
    );
  }

  createBall(playerPosition, playerSize) {
    const { x: playerX, y: playerY } = playerPosition;
    const { width: playerWidth, height: playerHeight } = playerSize;

    const safeZoneSize = 100;

    const possibleX = Array.from(
      Array(this.ecs.canvas.width - BALL_SIZE + 1).keys()
    );
    const possibleY = Array.from(
      Array(this.ecs.canvas.height - BALL_SIZE + 1).keys()
    );
    const safeX = possibleX.filter((x) => {
      return (
        x <= playerX - safeZoneSize || x >= playerX + playerWidth + safeZoneSize
      );
    });
    const safeY = possibleY.filter((y) => {
      return (
        y <= playerY - safeZoneSize ||
        y >= playerY + playerHeight + safeZoneSize
      );
    });

    const ballX = safeX[Math.floor(this.random() * safeX.length)];
    const ballY = safeY[Math.floor(this.random() * safeY.length)];

    const vx = playerX - ballX;
    const vy = playerY - ballY;
    const vectorLength = Math.sqrt(vx * vx + vy * vy);

    const normalized_vx = vx / vectorLength;
    const normalized_vy = vy / vectorLength;

    const speedFactor = this.getRandomBetween(6, 8);

    const position = new PositionComponent(ballX, ballY);
    const velocity = new VelocityComponent(
      normalized_vx * speedFactor,
      normalized_vy * speedFactor
    );

    const ball = this.ecs.addEntity();
    const color = new ColorComponent(
      Math.floor(this.getRandomBetween(200, 255)),
      Math.floor(this.getRandomBetween(200, 255)),
      Math.floor(this.getRandomBetween(200, 255))
    );

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

  updateScore() {
    const newScore =
      Math.round(this.ecs.timeMachine.elapsedTime / 100 / BALL_SPAWN_RATE) / 10;

    this.score = newScore;

    if (typeof this.callbacks.onScoreUpdate === "function") {
      this.callbacks.onScoreUpdate(newScore);
    }
  }

  /* Utils */
  getRandomBetween(min, max) {
    return Math.round(this.random() * (max - min) + min);
  }
}

export default Game;
