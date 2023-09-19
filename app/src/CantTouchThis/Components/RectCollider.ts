import { Component, Entity } from "~/src/CantTouchThis/GameEngine/ECS";
import PositionComponent from "./Position";
import SizeComponent from "./Size";

export default class RectColliderComponent extends Component {
  constructor(
    public position: PositionComponent,
    public size: SizeComponent,
    public collisions = new Set<Entity>()
  ) {
    super();
  }
}
