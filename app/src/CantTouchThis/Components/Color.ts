import { Component } from "~/src/CantTouchThis/GameEngine/ECS";

export default class ColorComponent extends Component {
  constructor(public r: number, public g: number, public b: number) {
    super();
  }
}
