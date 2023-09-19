import GameKey from "./GameKey";

class Keyboard {
  public gameKeys;

  constructor() {
    this.gameKeys = new Map();

    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));

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
      gameKey.isDown = true;
    }
  }

  handleKeyUp(event): void {
    const keyCode = event.code;
    if (this.gameKeys.has(keyCode)) {
      const gameKey = this.gameKeys.get(keyCode);
      gameKey.isDown = false;
    }
  }
}

export default Keyboard;
