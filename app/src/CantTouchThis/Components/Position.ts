import { Component } from "~/src/CantTouchThis/GameEngine/ECS";

export default class PositionComponent extends Component {
  constructor(public x: number, public y: number) {
    super();
  }
}
