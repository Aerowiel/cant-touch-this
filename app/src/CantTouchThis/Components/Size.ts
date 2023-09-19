import { Component } from "~/src/CantTouchThis/GameEngine/ECS";

export default class SizeComponent extends Component {
  constructor(public width: number, public height: number) {
    super();
  }
}
