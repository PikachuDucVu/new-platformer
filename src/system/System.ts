export interface System {
  process?(delta: number): void;
  dispose?(): void;
}

export type MaybePromise<T> = T | Promise<T>;
export type SystemFactory = () => MaybePromise<System>;

export class Manager<ContextType> {
  public static FIXED_STEP = 0.015;

  private _ctx: any = {};

  private beforeFuncs: SystemFactory[] = [];
  private afterFuncs: SystemFactory[] = [];

  private funcs: SystemFactory[] = [];
  private fixedStepFuncs: SystemFactory[] = [];

  private beforeSystems: System[] = [];
  private afterSystems: System[] = [];

  private systems: System[] = [];
  private fixedStepSystems: System[] = [];

  private initializing = false;
  private initialized = false;

  private accumulate = 0;

  public get context(): ContextType {
    return this._ctx;
  }

  register<K extends string, T>(key: K, dependency: T): Manager<ContextType & { [key in K]: T }> {
    this._ctx[key] = dependency;
    return this as any;
  }

  onBefore(func: SystemFactory) {
    this.beforeFuncs.push(func);
  }

  onAfter(func: SystemFactory) {
    this.afterFuncs.push(func);
  }

  addSystem(func: SystemFactory, fixedStep = false) {
    if (fixedStep) {
      this.fixedStepFuncs.push(func);
    } else {
      this.funcs.push(func);
    }
  }

  private async initialize() {
    this.initializing = true;
    for (const func of this.beforeFuncs) {
      let result = func();
      if (result instanceof Promise) {
        result = await result;
      }
      this.beforeSystems.push(result);
    }
    for (const func of this.funcs) {
      let result = func();
      if (result instanceof Promise) {
        result = await result;
      }
      this.systems.push(result);
    }
    for (const func of this.fixedStepFuncs) {
      let result = func();
      if (result instanceof Promise) {
        result = await result;
      }
      this.systems.push(result);
    }
    for (const func of this.afterFuncs) {
      let result = func();
      if (result instanceof Promise) {
        result = await result;
      }
      this.afterSystems.push(result);
    }
    this.initializing = false;
    this.initialized = true;
  }

  process(delta: number) {
    if (!this.initialized && !this.initializing) {
      this.initialize();
      return;
    }
    if (!this.initialized) {
      return;
    }
    this.accumulate += delta;
    while (this.accumulate >= Manager.FIXED_STEP) {
      this.accumulate -= Manager.FIXED_STEP;
      for (const system of this.fixedStepSystems) {
        system.process?.(Manager.FIXED_STEP);
      }
    }
    for (const system of this.beforeSystems) {
      system.process?.(delta);
    }
    for (const system of this.systems) {
      system.process?.(delta);
    }
    for (const system of this.afterSystems) {
      system.process?.(delta);
    }
  }

  dispose() {
    for (const system of this.systems) {
      system.dispose?.();
    }

    for (const system of this.fixedStepSystems) {
      system.dispose?.();
    }

    for (const system of this.beforeSystems) {
      system.dispose?.();
    }

    for (const system of this.afterSystems) {
      system.dispose?.();
    }
  }
}
