export type Entity = Number;

export abstract class Component {}

export abstract class System {
  public abstract componentsRequired: Set<Function>;

  public abstract update(entities: Set<Entity>, time: any): void;

  public ecs: ECS;
}

type ComponentClass<T extends Component> = new (...args: any[]) => T;

class ComponentContainer {
  private map = new Map<Function, Component>();

  public add(component: Component): void {
    this.map.set(component.constructor, component);
  }

  public get<T extends Component>(componentClass: ComponentClass<T>): T {
    return this.map.get(componentClass) as T;
  }

  public has(componentClass: Function): boolean {
    return this.map.has(componentClass);
  }

  public hasAll(componentClasses: Iterable<Function>): boolean {
    for (let cls of componentClasses) {
      if (!this.map.has(cls)) {
        return false;
      }
    }
    return true;
  }

  public delete(componentClass: Function): void {
    this.map.delete(componentClass);
  }
}

class ECS {
  private entities = new Map<Entity, ComponentContainer>();
  private systems = new Map<System, Set<Entity>>();
  private priorities = new Array<number>();
  private updateMap = new Map<number, Set<System>>();

  private nextEntityId = 0;
  private entitiesToDestroy = new Array<Entity>();

  public canvas;

  constructor(canvas: any) {
    this.canvas = canvas;
  }

  /* Entities API */
  public addEntity(): Entity {
    let entity = this.nextEntityId;
    this.nextEntityId++;
    this.entities.set(entity, new ComponentContainer());

    return entity;
  }

  public removeEntity(entity: Entity): void {
    this.entitiesToDestroy.push(entity);
  }

  /* Components API */
  public addComponent(entity: Entity, component: Component): void {
    this.entities.get(entity)?.add(component);
    this.checkEntity(entity);
  }

  public getComponents(entity: Entity): ComponentContainer {
    return this.entities.get(entity);
  }

  public removeComponent(entity: Entity, componentClass: Function): void {
    this.entities.get(entity)?.delete(componentClass);
    this.checkEntity(entity);
  }

  /* Systems API */
  public addSystem(priority: number, system: System): void {
    if (system.componentsRequired.size == 0) {
      console.warn(
        `System [${system.constructor.name}] not added: empty components list.`
      );
      return;
    }

    system.ecs = this;

    this.systems.set(system, new Set());
    for (let entity of this.entities.keys()) {
      this.checkEntitySystem(entity, system);
    }

    this.priorities = Array.from(new Set(this.priorities).add(priority));

    this.priorities.sort((a: number, b: number) => a - b);

    if (!this.updateMap.has(priority)) {
      this.updateMap.set(priority, new Set<System>());
    }

    this.updateMap.get(priority).add(system);
  }

  public removeSystem(system: System): void {
    this.systems.delete(system);
  }

  public update(time): void {
    this.clearCanvas();

    for (let priority of this.priorities) {
      let systems = this.updateMap.get(priority);

      for (let system of systems) {
        if (this.systems.get(system)?.size === 0) continue;
        system.update(this.systems.get(system));
      }
    }

    while (this.entitiesToDestroy.length > 0) {
      this.destroyEntity(this.entitiesToDestroy.pop(), time);
    }
  }

  public clearCanvas(): void {
    this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.context.beginPath();
  }

  /* Private methos for internal state management */
  private destroyEntity(entity: Entity): void {
    this.entities.delete(entity);
    for (let entities of this.systems.values()) {
      entities.delete(entity);
    }
  }

  private checkEntity(entity: Entity): void {
    for (let system of this.systems.keys()) {
      this.checkEntitySystem(entity, system);
    }
  }

  private checkEntitySystem(entity: Entity, system: System): void {
    const have = this.entities.get(entity);
    const need = system.componentsRequired;

    if (have?.hasAll(need)) {
      this.systems.get(system)?.add(entity);
    } else {
      this.systems.get(system)?.delete(entity);
    }
  }
}

export default ECS;
