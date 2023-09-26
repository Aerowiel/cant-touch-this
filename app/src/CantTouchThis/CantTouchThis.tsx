import { useRef, useState } from "react";
import GameOver from "~/src/CantTouchThis/Designs/GameOver";
import StartGame from "~/src/CantTouchThis/Designs/StartGame";
import { useSubmit } from "@remix-run/react";
import ScoreBoard from "./Designs/ScoreBoard";
import GameHistory from "./Utils/GameHistory";
import Game from "./Game/Game";
import LZUTF8 from "lzutf8";
import GameEncoder from "./Utils/GameEncoder";
import GameCompresser from "./Utils/GameCompressor";

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;

const CantTouchThis = ({ player, scores }) => {
  const canvasRef = useRef();

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [replay, setReplay] = useState(null);

  const submit = useSubmit();

  const startNewGame = () => {
    setScore(0);
    setGameOver(false);
    setStarted(true);

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

    console.log({ game });

    const encodedSnapshots = GameEncoder.encodeSnapshots(
      game.history.snapshots
    );
    console.log({ encoded: encodedSnapshots });

    const decodedSnapshots = GameEncoder.decodeSnapshots(encodedSnapshots);
    console.log({ decoded: decodedSnapshots });
    console.log({ base: game.history.snapshots });

    setReplay({ seed: game.seed, snapshots: decodedSnapshots });

    const formData = new FormData();
    formData.set("action", "endGame");
    formData.set("score", game.score);
    formData.set("s", game.seed);
    formData.set("h", encodedSnapshots);
    const compressedSnapshots = GameCompresser.compress(formData.get("h"));
    formData.set("h", compressedSnapshots);

    submit(formData, { method: "post", action: "/?index" });
  };

  const replayGame = async () => {
    if (!replay) return;

    setStarted(true);
    setGameOver(false);

    const { seed, snapshots } = replay;

    const canvas = {
      width: CANVAS_HEIGHT,
      height: CANVAS_WIDTH,
      context: canvasRef.current.getContext("2d"),
    };

    const _game = new Game({
      seed,
      canvas,
      callbacks: {
        onScoreUpdate: setScore,
      },
    });

    await _game.clientReplay(snapshots);

    setStarted(false);
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
          <GameOver score={score} />
        ) : started ? (
          <div className="cant-touch-this__score">SCORE: {score}</div>
        ) : null}

        {!started && (
          <>
            <ScoreBoard scores={scores} />
            <button onClick={replayGame}>replay</button>

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
      </div>
    </div>
  );
};

export default CantTouchThis;
