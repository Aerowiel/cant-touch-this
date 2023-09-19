import { Component } from "~/src/CantTouchThis/GameEngine/ECS";

export default class HealthComponent extends Component {
  constructor(public value: number) {
    super();
  }
}
