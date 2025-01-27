import { AsyncStack } from "../polyfill/AsyncStack";
import { AsyncVariable, AsyncStore } from "./AsyncVariable";
import { runInFork } from "./utils/runInFork";

type AnyFunction = (...args: any) => any;

export class AsyncSnapshot {
  private dataByVariable = new Map<AsyncVariable, any>();

  private capture() {
    let current = AsyncStack.getCurrent();
    while (current) {
      const variables = AsyncStore.variableByStack.get(current);
      variables?.forEach((variable) => {
        const alreadyHasVariable = this.dataByVariable.has(variable);
        if (!alreadyHasVariable) {
          const value = variable.get();
          this.dataByVariable.set(variable, value);
        }
      });

      current = current.origin;
    }
  }

  constructor() {
    this.capture();
  }

  static create() {
    const snapshot = new AsyncSnapshot();
    return snapshot;
  }

  run<Fn extends AnyFunction>(callback: Fn) {
    return runInFork(() => {
      const current = AsyncStack.getCurrent();
      AsyncStore.stopWalkAt.add(current);

      this.dataByVariable.forEach((data, variable) => {
        variable.set(data);
      });

      return callback();
    });
  }

  wrap<Fn extends AnyFunction>(callback: Fn) {
    return (...args) => this.run(() => callback(...args));
  }

  static wrap<Fn extends AnyFunction>(callback: Fn) {
    return runInFork(() => {
      const snapshot = AsyncSnapshot.create();
      return snapshot.wrap(callback);
    });
  }
}
