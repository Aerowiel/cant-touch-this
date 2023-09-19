import { Component } from "~/src/CantTouchThis/GameEngine/ECS";

export default class VelocityComponent extends Component {
  constructor(public vx: number = 0, public vy: number = 0) {
    super();
  }
}
