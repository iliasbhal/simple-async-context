export class SimpleAsyncContext {
  static current: SimpleAsyncContext = null

  static get() {
    return this.current;
  }

  static getStackId() {
    return this.current?.id;
  }

  static getId() {
    const currentId = this.current?.id.split('/').filter((el) => el !== '.').pop();
    return currentId;
  }

  static set(ctx: SimpleAsyncContext) {
    this.current = ctx;
  }

  static fork(id?: any) {
    const parent = SimpleAsyncContext.get();
    const fordId = `${parent?.id || '.'}/${id || '.'}`;
    const fork = new SimpleAsyncContext(fordId, parent);

    fork.start();
    return fork
  }

  static run(id: any, callback: Function) {
    const asyncfork = this.fork(id);
    const result = callback();
    asyncfork.reset();
    return result;
  }

  static wrap(id: any, callback: Function) {
    return (...args) => {
      return SimpleAsyncContext.run(id, () => callback(...args));
    }
  }

  id: any;
  parent: SimpleAsyncContext;
  constructor(id: any, parent: SimpleAsyncContext) {
    this.id = id;
    this.parent = parent;
  }

  start() {
    SimpleAsyncContext.set(this);
  }

  reset() {
    SimpleAsyncContext.set(this.parent);
  }

  createResolver(callback) {
    return (...args: any[]) => {
      this.reset();

      const fork = SimpleAsyncContext.fork()
      const result = callback(...args);
      fork.reset();
      return result;
    }
  }
}