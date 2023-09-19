import { useEffect, useRef, useState } from "react";
import ECS from "~/src/CantTouchThis/GameEngine/ECS";
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
} from "~/src/CantTouchThis/Components";
import GameOver from "~/src/CantTouchThis/Designs/GameOver";
import {
  PlayerInputSystem,
  MovementSystem,
  PlayerRendererSystem,
  BallRendererSystem,
  CollisionDetectorSystem,
  CollisionDamageSystem,
  WallBounceSystem,
} from "~/src/CantTouchThis/Systems";
import Keyboard from "~/src/CantTouchThis/Utils/Keyboard";
import StartGame from "~/src/CantTouchThis/Designs/StartGame";

// 600 in hex32
const CANVAS_WIDTH = parseInt("io", 32);
const CANVAS_HEIGHT = parseInt("io", 32);

export const BALL_SPAWN_RATE = 3;
const BALL_SIZE = 20;

const CantTouchThis = ({ player, scores }) => {
  const canvasRef = useRef();
  const gameLoopRef = useRef();
  const ecs = useRef<ECS>();

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const paused = useRef(false);

  const nextBallSpawn = useRef(0);

  const [score, setScore] = useState(0);

  const animate = (timeInMilliseconds, player) => {
    if (!paused.current) {
      const playerComponents = ecs.current?.getComponents(player);
      const playerHealth = playerComponents?.get(HealthComponent);

      if (playerHealth?.value <= 0) {
        setGameOver(true);
        setStarted(false);
        cancelAnimationFrame(gameLoopRef.current);
        return;
      }
      if (timeInMilliseconds >= nextBallSpawn.current) {
        // Increase score
        setScore((previousScore) => previousScore + 1);

        const playerPosition = playerComponents.get(PositionComponent);
        const { x: playerX, y: playerY } = playerPosition;
        const { size: playerSize } = playerComponents?.get(
          RectColliderComponent
        );
        const { width: playerWidth, height: playerHeight } = playerSize;

        const safeZoneSize = 40;
        // const safeZone = {leftRight: {x: playerX - (safeZoneSize / 2) , y: playerY - (safeZoneSize / 2) }, rightBottom: {x: playerX + playerWidth + (safeZoneSize / 2) }}

        const possibleX = Array.from(
          Array(CANVAS_WIDTH - BALL_SIZE + 1).keys()
        );
        const possibleY = Array.from(
          Array(CANVAS_HEIGHT - BALL_SIZE + 1).keys()
        );
        const safeX = possibleX.filter((x) => {
          return (
            x <= playerX - safeZoneSize ||
            x >= playerX + playerWidth + safeZoneSize
          );
        });
        const safeY = possibleY.filter((y) => {
          return (
            y <= playerY - safeZoneSize ||
            y >= playerY + playerHeight + safeZoneSize
          );
        });

        const ballX = safeX[Math.floor(Math.random() * safeX.length)];
        const ballY = safeY[Math.floor(Math.random() * safeY.length)];

        const vx = playerX - ballX;
        const vy = playerY - ballY;
        const vectorLength = Math.sqrt(vx * vx + vy * vy);

        const normalized_vx = vx / vectorLength;
        const normalized_vy = vy / vectorLength;

        const speedFactor = score % 5 === 0 ? 8 : 6;

        createBall(
          new PositionComponent(ballX, ballY),
          new VelocityComponent(
            normalized_vx * speedFactor,
            normalized_vy * speedFactor
          )
        );
        nextBallSpawn.current = timeInMilliseconds + 1000 * BALL_SPAWN_RATE;
      }

      ecs.current.update(timeInMilliseconds);
    }
    gameLoopRef.current = requestAnimationFrame((timeInMilliseconds) =>
      animate(timeInMilliseconds, player)
    );
  };

  const getRandomBetween = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
  };

  const createBall = (position, velocity) => {
    if (!ecs.current) return;

    const ball = ecs.current.addEntity();
    const color = new ColorComponent(
      Math.floor(getRandomBetween(200, 255)),
      Math.floor(getRandomBetween(200, 255)),
      Math.floor(getRandomBetween(200, 255))
    );

    ecs.current.addComponent(ball, color);

    ecs.current.addComponent(ball, position);
    const size = new SizeComponent(BALL_SIZE, BALL_SIZE);
    ecs.current.addComponent(ball, size);
    ecs.current.addComponent(ball, new RectColliderComponent(position, size));
    ecs.current.addComponent(ball, velocity);
    ecs.current.addComponent(ball, new BallComponent());
    ecs.current.addComponent(ball, new BouncyComponent());

    return ball;
  };

  const startNewGame = () => {
    setScore(0);
    setGameOver(false);
    setStarted(true);
    nextBallSpawn.current = 0;

    const canvasElement: HTMLCanvasElement | null =
      document.getElementById("game");

    if (!canvasElement) {
      console.error("Canvas element not found");
      return;
    }

    /* @TODO find a way to prevent this mutation */
    const canvas = {
      width: CANVAS_HEIGHT,
      height: CANVAS_WIDTH,
      context: canvasRef.current.getContext("2d"),
    };

    ecs.current = new ECS(canvas);
    const keyboard = new Keyboard();

    ecs.current.addSystem(10, new PlayerInputSystem(keyboard));

    ecs.current.addSystem(70, new CollisionDetectorSystem());
    ecs.current.addSystem(71, new CollisionDamageSystem());
    ecs.current.addSystem(80, new WallBounceSystem());
    ecs.current.addSystem(90, new MovementSystem());
    ecs.current.addSystem(100, new BallRendererSystem());
    ecs.current.addSystem(100, new PlayerRendererSystem());

    // Player init
    const player = ecs.current.addEntity();
    ecs.current.addComponent(player, new PlayerComponent());

    const size = new SizeComponent(20, 20);
    ecs.current.addComponent(player, size);
    const position = new PositionComponent(canvas.width / 2, canvas.height / 2);
    ecs.current.addComponent(player, position);
    ecs.current.addComponent(player, new RectColliderComponent(position, size));
    ecs.current.addComponent(player, new VelocityComponent());
    ecs.current.addComponent(player, new HealthComponent(1));

    gameLoopRef.current = requestAnimationFrame((timeInMilliseconds) =>
      animate(timeInMilliseconds, player)
    );
  };

  return (
    <div className="cant-touch-this">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {gameOver ? (
          <GameOver score={score} canvas={canvasRef.current} />
        ) : started ? (
          <div className="cant-touch-this__score">SCORE: {score}</div>
        ) : null}
        {!started && (
          <>
            <div className="score-board">
              <div className="score-board__title">SCOREBOARD</div>
              <table className="score-board-table">
                <thead>
                  <tr>
                    <th>Place</th>
                    <th>Pseudonyme</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr key={score.id} className="score-board-table-row">
                      <td className="score-board-table-row__place">
                        #{index + 1}
                      </td>
                      <td className="score-board-table-row__pseudonyme">
                        {score.pseudonyme}
                      </td>
                      <td className="score-board-table-row__score">
                        {score.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <StartGame
              isRetry={gameOver}
              startNewGame={startNewGame}
              player={player}
            />
          </>
        )}
        <div
          className="cant-touch-this__canvas-container"
          style={{
            width: 600,
            height: 600,
            display: !started || gameOver ? "none" : "block",
          }}
        >
          <canvas
            id="game"
            ref={canvasRef}
            width={600}
            height={600}
            style={{ border: "1px solid black" }}
          ></canvas>
        </div>
      </div>
    </div>
  );
};

export default CantTouchThis;
