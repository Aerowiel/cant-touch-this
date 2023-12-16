import { FaRegPlayCircle } from "react-icons/fa/index.js";

const ScoreBoard = ({ scores, replayGame }) => {
  return (
    <div className="score-board">
      <div className="score-board__title">SCOREBOARD</div>
      <div className="score-board__alpha-disclaimer">
        <div>
          This is an alpha version of the game, the scoreboard will be reset
          quite often.
        </div>
        <div>How to move ? Arrows or WQSD</div>
        <div>Bonus : green = life or max life, yellow = destroy some balls</div>
      </div>
      <table className="score-board-table">
        <thead>
          <tr>
            <th>Place</th>
            <th>Pseudonyme</th>
            <th>Score</th>
            <th>Replay</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => (
            <tr key={score.id} className="score-board-table-row">
              <td className="score-board-table-row__place">#{index + 1}</td>
              <td className="score-board-table-row__pseudonyme">
                {score.pseudonyme}
              </td>
              <td className="score-board-table-row__score">{score.score}</td>
              {score.replay ? (
                <td className="score-board-table-row__replay">
                  <div>
                    <FaRegPlayCircle onClick={() => replayGame(score.replay)} />
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreBoard;
