import GameKey from "./GameKey";

class Keyboard {
  public gameKeys;

  constructor(disabled) {
    this.gameKeys = new Map();

    if (!disabled) {
      document.addEventListener("keydown", this.handleKeyDown.bind(this));
      document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    this.setup();
  }

  setup(): void {
    this.register(new GameKey(GameKey.up));
    this.register(new GameKey(GameKey.left));
    this.register(new GameKey(GameKey.down));
    this.register(new GameKey(GameKey.right));
    this.register(new GameKey(GameKey.arrowUp));
    this.register(new GameKey(GameKey.arrowLeft));
    this.register(new GameKey(GameKey.arrowDown));
    this.register(new GameKey(GameKey.arrowRight));
  }

  register(gameKey: GameKey): void {
    this.gameKeys.set(gameKey.code, gameKey);
  }

  handleKeyDown(event): void {
    const keyCode = event.code;
    if (this.gameKeys.has(keyCode)) {
      const gameKey = this.gameKeys.get(keyCode);
      gameKey.previousIsDown = gameKey.isDown;
      gameKey.isDown = true;
    }
  }

  handleKeyUp(event): void {
    const keyCode = event.code;
    if (this.gameKeys.has(keyCode)) {
      const gameKey = this.gameKeys.get(keyCode);
      gameKey.previousIsDown = gameKey.isDown;
      gameKey.isDown = false;
    }
  }

  /* Replay related, to move into a Replay class */
  getKeys() {
    const keysState = [];

    [...this.gameKeys].forEach(([_, gameKey], index) => {
      if (gameKey.previousIsDown !== gameKey.isDown)
        keysState.push(`${index}${~~gameKey.isDown}`);
    });

    return keysState;
  }

  setKeys(keys): void {
    const gameKeyArray = [...this.gameKeys];

    keys.map((key) => {
      const keyIndex = key.slice(0, -1);
      const keyIsDown = Boolean(Number(key.slice(-1)));
      gameKeyArray[keyIndex][1].isDown = Boolean(Number(keyIsDown));
    });

    this.gameKeys = new Map(gameKeyArray);
  }
}

export default Keyboard;
