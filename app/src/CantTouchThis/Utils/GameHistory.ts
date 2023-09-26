class GameHistory {
  public snapshots: any;

  constructor() {
    this.snapshots = [];
  }

  update(snapshot): void {
    this.snapshots.push(snapshot);
  }
}

export default GameHistory;
