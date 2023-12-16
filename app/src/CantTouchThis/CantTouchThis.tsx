import { useRef, useState } from "react";
import GameOver from "~/src/CantTouchThis/Designs/GameOver";
import StartGame from "~/src/CantTouchThis/Designs/StartGame";
import { useNavigate, useSubmit } from "@remix-run/react";
import ScoreBoard from "./Designs/ScoreBoard";
import Game from "./Game/Game";
import GameCompressor from "./Utils/GameCompressor";
import HealthBar from "./Designs/HealthBar";
import StopReplay from "./Designs/StopReplay";
import NumberOfPlayers from "./Designs/NumberOfPlayers";

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;

const CantTouchThis = ({ player, scores, numberOfPlayers }) => {
  const canvasRef = useRef();

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(null);

  const [replaying, setReplaying] = useState(null);
  const replayController = useRef(null);

  const submit = useSubmit();

  const startNewGame = () => {
    setScore(0);
    setGameOver(false);
    setStarted(true);
    setHealth({ health: 3, maxHealth: 3 });

    const canvas = {
      width: CANVAS_HEIGHT,
      height: CANVAS_WIDTH,
      context: canvasRef.current.getContext("2d"),
    };

    const game = new Game({
      canvas,
      callbacks: {
        onScoreUpdate: setScore,
        onEndGame: handleEndGame,
        onPlayerHealthUpdate: setHealth,
      },
    });

    game.start();

    window.addEventListener("blur", () => {
      if (game.started) {
        game.end();
      }
    });
  };

  const handleEndGame = (game) => {
    setGameOver(true);
    setStarted(false);

    /* No need to send score if it's not a potential high score */
    if (
      scores.length < 10 ||
      scores.some((highScore) => {
        return highScore.score < game.score;
      })
    ) {
      const { score, seed } = game;
      const compressedGameState = GameCompressor.compress(
        score,
        seed,
        game.history.snapshots
      );

      const formData = new FormData();
      formData.set("action", "endGame");
      formData.set("h", compressedGameState);

      submit(formData, { method: "post", action: "/?index" });
    }
  };

  const replayGame = async (compressedGameState) => {
    const { seed, snapshots } = GameCompressor.decompress(compressedGameState);

    setReplaying(true);
    setGameOver(false);
    setStarted(true);
    setHealth({ health: 3, maxHealth: 3 });

    const canvas = {
      width: CANVAS_HEIGHT,
      height: CANVAS_WIDTH,
      context: canvasRef.current.getContext("2d"),
    };

    const game = new Game({
      seed,
      canvas,
      callbacks: {
        onScoreUpdate: setScore,
        onEndGame: () => {
          setStarted(false);
          setReplaying(false);
        },
        onPlayerHealthUpdate: setHealth,
      },
    });

    const controller = new AbortController();
    replayController.current = controller;
    const signal = replayController.current.signal;
    await game.clientReplay(snapshots, signal);
  };

  const stopReplay = () => {
    replayController.current.abort();
  };

  return (
    <div className="cant-touch-this">
      {numberOfPlayers && <NumberOfPlayers numberOfPlayers={numberOfPlayers} />}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {gameOver ? (
          <GameOver score={score} />
        ) : started ? (
          <>
            <div className="cant-touch-this__score">SCORE: {score}</div>
            <HealthBar {...health} />
          </>
        ) : null}

        {!started && (
          <>
            <ScoreBoard scores={scores} replayGame={replayGame} />
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
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            display: !started || gameOver ? "none" : "block",
          }}
        >
          <canvas
            id="game"
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          ></canvas>
        </div>
        {replaying ? <StopReplay stopReplay={stopReplay} /> : null}
      </div>
    </div>
  );
};

export default CantTouchThis;
