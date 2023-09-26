const SNAPSHOT_DATA_SEPARATOR = "_";
const GAME_KEYS_SEPARATOR = ",";
const SNAPSHOT_DELIMITER = ";";

class GameEncoder {
  static encodeSnapshots(snapshots): any {
    let previousTime = 0;

    const encodedSnapshots = snapshots
      .map(([time, gameKeys]) => {
        /* Number cast + toFixed prevent floating number problem */
        const timeDifference =
          (Number((time * 1000).toFixed(3)) -
            Number((previousTime * 1000).toFixed(3))) /
          1000;

        previousTime = time;

        return `${timeDifference}${SNAPSHOT_DATA_SEPARATOR}${gameKeys}`;
      })
      .join(SNAPSHOT_DELIMITER);

    return encodedSnapshots;
  }

  static decodeSnapshots(encodedSnapshots): any {
    let previousTime = 0;

    const decodedSnapshots = encodedSnapshots
      .split(SNAPSHOT_DELIMITER)
      .map((encodedSnapshot) => {
        const [time, joinedGameKeys] = encodedSnapshot.split(
          SNAPSHOT_DATA_SEPARATOR
        );
        // If there is no game key data for this snapshot just return an empty array, no action were performed during this frame
        const gameKeys = joinedGameKeys
          ? joinedGameKeys.split(GAME_KEYS_SEPARATOR)
          : [];

        const cumulatedTime =
          (Number((previousTime * 1000).toFixed(3)) +
            Number((time * 1000).toFixed(3))) /
          1000;

        previousTime = cumulatedTime;

        return [cumulatedTime, gameKeys];
      });

    return decodedSnapshots;
  }
}

export default GameEncoder;
