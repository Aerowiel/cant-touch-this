import { useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import CryptoJS from "crypto-js";

const e = (s) => {
  return CryptoJS.AES.encrypt(s.toString(), "jVAriiJYoR7OZBW").toString();
};

const GameOver = ({ score, canvas }) => {
  const submit = useSubmit();

  useEffect(() => {
    const handleEndGame = () => {
      const formData = new FormData();
      formData.set("action", "endGame");
      formData.set("userId", e(score));
      formData.set("score", score);
      submit(formData, { method: "post", action: "/?index" });
    };

    handleEndGame();
  }, []);

  return (
    <div className="game-over">
      <div className="game-over__game-over">GAME OVER</div>
      <div className="game-over__score">SCORE: {score}</div>
    </div>
  );
};

export default GameOver;
