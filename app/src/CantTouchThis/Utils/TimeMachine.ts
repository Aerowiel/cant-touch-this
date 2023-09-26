class TimeMachine {
  public previousTime;
  public elapsedTime;

  constructor() {
    this.elapsedTime = 0;
  }

  update(currentTime: number): number {
    if (!this.previousTime) {
      this.previousTime = currentTime;
    }

    const delta = currentTime - this.previousTime;
    this.previousTime = currentTime;
    this.elapsedTime += delta;

    return delta;
  }
}

export default TimeMachine;
