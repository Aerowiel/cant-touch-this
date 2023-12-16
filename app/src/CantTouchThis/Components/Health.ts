import { Component } from "~/src/CantTouchThis/GameEngine/ECS";

export default class HealthComponent extends Component {
  constructor(public health: number, public maxHealth: number) {
    super();
  }
}
