import { useSubmit } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";

const START_RETRY_KEY_CODES = ["Space", "Enter"];

const StartButton = ({ pseudonyme, isRetry, startNewGame }) => {
  const handleKeyUp = useCallback((event) => {
    if (START_RETRY_KEY_CODES.includes(event.code)) {
      startNewGame();
    }
  }, []);

  useEffect(() => {
    if (!pseudonyme) return;

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pseudonyme]);
  return (
    <button
      disabled={!pseudonyme}
      className="start-button"
      onClick={() => startNewGame()}
    >
      {isRetry ? "Press [SPACE] to retry" : "Start"}
    </button>
  );
};

const StartGame = ({ player, isRetry, startNewGame }) => {
  const submit = useSubmit();

  const [pseudonyme, setPseudonyme] = useState(player?.pseudonyme ?? "");
  const inputIsFocused = useRef(false);

  const handleStartNewGame = () => {
    if (inputIsFocused.current) return;
    const formData = new FormData();
    formData.set("action", "startNewGame");
    formData.set("pseudonyme", pseudonyme);
    submit(formData, { method: "post", action: "/?index" });
    startNewGame();
  };

  return (
    <div className="start-game">
      <div className="choose-pseudonyme">
        <div className="choose-pseudonyme__label">
          <span>Pseudonyme</span>
          <span className="max-characters">(max 3 characters)</span>
        </div>
        <input
          className="choose-pseudonyme__input"
          onFocus={() => (inputIsFocused.current = true)}
          onBlur={() => (inputIsFocused.current = false)}
          value={pseudonyme}
          onChange={(event) => setPseudonyme(event.target.value)}
          maxLength={3}
        ></input>
      </div>

      <StartButton
        pseudonyme={pseudonyme}
        isRetry={isRetry}
        startNewGame={handleStartNewGame}
      />
    </div>
  );
};

export default StartGame;
