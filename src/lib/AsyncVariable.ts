import { AsyncStack } from "../polyfill/AsyncStack";
import { runInFork } from "./utils/runInFork";

type AnyFunction = (...args: any) => any;

type VariableDataBox<Value = any> = { value: Value };

export class AsyncStore {
  static stopWalkAt = new WeakSet<AsyncStack>();
  static variableByStack = new WeakMap<AsyncStack, Set<AsyncVariable>>();
  static linkVariableWithStack(variable: AsyncVariable, stack: AsyncStack) {
    if (!AsyncStore.variableByStack.has(stack)) {
      AsyncStore.variableByStack.set(stack, new Set());
    }

    AsyncStore.variableByStack.get(stack).add(variable);
  }
}

export class AsyncVariable<Value = any> {
  private data = new WeakMap<AsyncStack, VariableDataBox>();

  private getBox(stack: AsyncStack): VariableDataBox<Value> | undefined {
    if (!stack) return undefined;

    const currentBox = this.data.get(stack);
    if (currentBox) return currentBox;

    const canWalkOrigin = AsyncStore.stopWalkAt.has(stack);
    if (canWalkOrigin) return undefined;

    const parentBox = this.getBox(stack.origin);
    if (parentBox) this.setBox(stack, parentBox);
    return parentBox;
  }

  private setBox(stack: AsyncStack, box: { value: Value }) {
    AsyncStore.linkVariableWithStack(this, stack);
    this.data.set(stack, box);
  }

  set(value: Value) {
    const current = AsyncStack.getCurrent();
    this.setBox(current, { value });
  }

  get(): Value {
    const current = AsyncStack.getCurrent();
    return this.getBox(current)?.value;
  }

  run<Fn extends AnyFunction>(
    data: Value,
    callback: Fn,
  ): Fn extends (...args: any[]) => infer R ? R : any {
    return runInFork(() => {
      const current = AsyncStack.getCurrent();
      this.setBox(current, {
        value: data,
      });

      return callback();
    });
  }

  wrap<Fn extends AnyFunction>(data: Value, callback: Fn): Fn {
    // @ts-ignore
    return (...args) => this.run(data, () => callback(...args));
  }
}
