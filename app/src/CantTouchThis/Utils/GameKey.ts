class GameKey {
  static up = "KeyW";
  static left = "KeyA";
  static down = "KeyS";
  static right = "KeyD";

  // Pour elsa
  static arrowUp = "ArrowUp";
  static arrowLeft = "ArrowLeft";
  static arrowDown = "ArrowDown";
  static arrowRight = "ArrowRight";

  constructor(
    public code: string,
    public isDown: boolean = false,
    public previousIsDown: Boolean = false
  ) {}
}

export default GameKey;
