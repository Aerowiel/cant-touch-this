class GameKey {
  constructor(public code: string, public isDown: boolean = false) {}
}

GameKey.up = "KeyW";
GameKey.left = "KeyA";
GameKey.down = "KeyS";
GameKey.right = "KeyD";

// Pour elsa
GameKey.arrowUp = "ArrowUp";
GameKey.arrowLeft = "ArrowLeft";
GameKey.arrowDown = "ArrowDown";
GameKey.arrowRight = "ArrowRight";

export default GameKey;
