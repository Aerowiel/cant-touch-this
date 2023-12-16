import LZUTF8 from "lzutf8";

const GAME_DATA_SEPARATOR = "|";
const SNAPSHOT_DATA_SEPARATOR = "_";
const GAME_KEYS_SEPARATOR = ",";
const SNAPSHOT_DELIMITER = ";";

class GameCompressor {
  static compress(score, seed, snapshots): any {
    let previousTime = 0;

    const encodedSnapshots = snapshots.map(([time, gameKeys]) => {
      /* Number cast + toFixed prevent floating number problem */
      const timeDifference =
        (Number((time * 1000).toFixed(3)) -
          Number((previousTime * 1000).toFixed(3))) /
        1000;

      previousTime = time;

      return `${timeDifference}${SNAPSHOT_DATA_SEPARATOR}${gameKeys}`;
    });

    const stringSnapshots = encodedSnapshots.join(SNAPSHOT_DELIMITER);
    const stringGameData = [score, seed, stringSnapshots].join(
      GAME_DATA_SEPARATOR
    );

    const compressedGameData = LZUTF8.compress(stringGameData, {
      outputEncoding: "Base64",
    });
    return compressedGameData;
  }

  static decompress(compressedGameData): any {
    const stringGameData = LZUTF8.decompress(compressedGameData, {
      inputEncoding: "Base64",
    });

    const [stringScore, seed, stringSnapshots] =
      stringGameData.split(GAME_DATA_SEPARATOR);

    const score = Number(stringScore);
    const snapshots = stringSnapshots.split(SNAPSHOT_DELIMITER);

    let previousTime = 0;

    const decodedSnapshots = snapshots.map((encodedSnapshot) => {
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

    return { score, seed, snapshots: decodedSnapshots };
  }
}

export default GameCompressor;
