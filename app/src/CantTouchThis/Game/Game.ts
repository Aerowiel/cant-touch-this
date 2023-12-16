import { v4 as uuidv4 } from "uuid";
import seedRandom from "seedrandom";

import ECS from "../GameEngine/ECS";
import Keyboard from "../Utils/Keyboard";
import TimeMachine from "../Utils/TimeMachine";
import GameHistory from "../Utils/GameHistory";
import {
  BallRendererSystem,
  BonusRendererSystem,
  CollisionDamageSystem,
  CollisionDetectorSystem,
  MovementSystem,
  PlayerInputSystem,
  PlayerRendererSystem,
  WallBounceSystem,
  SpawnerSystem,
} from "../Systems";
import {
  HealthComponent,
  PlayerComponent,
  PositionComponent,
  RectColliderComponent,
  SizeComponent,
  VelocityComponent,
} from "../Components";
import CollisionBonusSystem from "../Systems/CollisionBonus";

const BALL_SPAWN_RATE = 3;

class Game {
  public ecs;
  public server;

  public seed;
  public random;

  public history;

  public player;
  public score;
  public numberOfBalls;
  public started;

  public gameLoopRef;

  private callbacks;

  constructor({ seed = uuidv4(), canvas, callbacks, server = false }) {
    this.server = server;
    this.callbacks = callbacks;

    const keyboard = new Keyboard(server);
    const timeMachine = new TimeMachine();
    this.history = new GameHistory();

    const randomSeed = seed;
    this.seed = randomSeed;
    const random = seedRandom(randomSeed);

    this.ecs = new ECS(canvas, keyboard, timeMachine, random);

    this.score = 0;
    this.numberOfBalls = 0;

    this.initSystems();
    this.initPlayer();
  }

  initSystems() {
    this.ecs.addSystem(10, new PlayerInputSystem());
    this.ecs.addSystem(20, new SpawnerSystem());
    this.ecs.addSystem(70, new CollisionDetectorSystem());
    this.ecs.addSystem(71, new CollisionBonusSystem());
    this.ecs.addSystem(72, new CollisionDamageSystem());
    this.ecs.addSystem(80, new WallBounceSystem());
    this.ecs.addSystem(90, new MovementSystem());
    /* Server replay doesnt need the render systems */
    if (!this.server) {
      this.ecs.addSystem(100, new BallRendererSystem());
      this.ecs.addSystem(100, new PlayerRendererSystem());
      this.ecs.addSystem(100, new BonusRendererSystem());
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
    this.ecs.addComponent(player, new HealthComponent(3, 3));

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

    // cancel animation frame doesnt exists serverside and is not needed
    if (!this.server) {
      cancelAnimationFrame(this.gameLoopRef);
    }
    if (typeof this.callbacks.onEndGame === "function") {
      this.callbacks.onEndGame(this);
    }
  }

  async clientReplay(snapshots, signal) {
    return this.replay(snapshots, true, signal);
  }

  serverReplay(snapshots) {
    this.replay(snapshots, false, null);
  }

  async replay(snapshots, isClient, signal) {
    let previousTimeInMilliseconds = null;

    for (const snapshot of snapshots) {
      if (isClient && signal.aborted) {
        this.end();
        return;
      }
      const timeInMilliseconds = snapshot[0];
      const gameKeys = snapshot[1];

      this.ecs.keyboard.setKeys(gameKeys);

      const playerComponents = this.ecs.getComponents(this.player);
      const playerHealth = playerComponents?.get(HealthComponent);

      // @TODO find a way to not call this callback if the player health didnt update
      if (typeof this.callbacks.onPlayerHealthUpdate === "function") {
        this.callbacks.onPlayerHealthUpdate(playerHealth);
      }

      if (playerHealth.health <= 0) {
        this.end();
        return;
      }

      this.updateScore();

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

    if (typeof this.callbacks.onPlayerHealthUpdate === "function") {
      this.callbacks.onPlayerHealthUpdate(playerHealth);
    }

    if (playerHealth.health <= 0) {
      this.end();
      return;
    }

    this.updateScore();

    this.ecs.update(timeInMilliseconds);

    this.gameLoopRef = requestAnimationFrame((timeInMilliseconds) =>
      this.gameLoop(timeInMilliseconds, nextBallSpawn)
    );
  }

  updateScore() {
    const newScore =
      Math.round(this.ecs.timeMachine.elapsedTime / 100 / BALL_SPAWN_RATE) / 10;

    this.score = newScore;

    if (typeof this.callbacks.onScoreUpdate === "function") {
      this.callbacks.onScoreUpdate(newScore);
    }
  }
}

export default Game;
