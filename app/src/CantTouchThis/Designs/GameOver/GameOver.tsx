import { useSubmit } from "@remix-run/react";
import { useEffect } from "react";

const GameOver = ({ score }) => {
  return (
    <div className="game-over">
      <div className="game-over__game-over">GAME OVER</div>
      <div className="game-over__score">SCORE: {score}</div>
    </div>
  );
};

export default GameOver;
