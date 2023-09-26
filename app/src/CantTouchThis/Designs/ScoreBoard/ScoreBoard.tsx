const ScoreBoard = ({ scores }) => {
  return (
    <div className="score-board">
      <div className="score-board__title">SCOREBOARD</div>
      <div className="score-board__alpha-disclaimer">
        <div>
          This is an alpha version of the game, the scoreboard will be reset
          quiet often.
        </div>
      </div>
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
              <td className="score-board-table-row__place">#{index + 1}</td>
              <td className="score-board-table-row__pseudonyme">
                {score.pseudonyme}
              </td>
              <td className="score-board-table-row__score">{score.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreBoard;
