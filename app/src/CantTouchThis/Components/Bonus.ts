import { Component } from "~/src/CantTouchThis/GameEngine/ECS";

export default class BonusComponent extends Component {
  static TYPES = {
    HEALTH: "health",
    DESTROY_ONE_FOURTH_BALLS: "destroy_one_fourth_balls",
  };

  constructor(public type: string) {
    super();
  }
}
