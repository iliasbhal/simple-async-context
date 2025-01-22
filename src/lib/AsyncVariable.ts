import { AsyncStack } from '../polyfills/AsyncStack';
import { runInFork } from './utils/runInFork';

type AnyFunction = (...args: any) => any;

type VariableDataBox<Value = any> = { value: Value }

export class AsyncVariable<Value = any> {
  data = new WeakMap<AsyncStack, VariableDataBox>

  debugId?: string
  constructor(id?: string) {
    if (id) this.debugId = id;
  }

  static variableByStack = new WeakMap<AsyncStack, Set<AsyncVariable>>;
  static registerVariable(variable: AsyncVariable, stack: AsyncStack) {
    if (!AsyncVariable.variableByStack.has(stack)) {
      AsyncVariable.variableByStack.set(stack, new Set());
    }

    AsyncVariable.variableByStack.get(stack).add(variable);
  }


  getBox(stack: AsyncStack): VariableDataBox<Value> | undefined {
    if (!stack) return undefined;

    const currentBox = this.data.get(stack);
    if (currentBox) return currentBox;

    const parentBox = this.getBox(stack.origin);
    if (parentBox) this.setBox(stack, parentBox);
    return parentBox;
  }

  setBox(stack: AsyncStack, box: { value: Value }) {
    AsyncVariable.registerVariable(this, stack);
    this.data.set(stack, box);
  }

  set(stack: AsyncStack, data: any) {
    this.setBox(stack, {
      value: data
    });
  }

  get(): Value {
    const current = AsyncStack.getCurrent();
    return this.getBox(current)?.value;
  }

  run<Fn extends AnyFunction>(data: Value, callback: Fn) {
    return runInFork(() => {
      const current = AsyncStack.getCurrent();
      this.set(current, data);
      return callback();
    });
  }

  wrap<Fn extends AnyFunction>(data: Value, callback: Fn): Fn {
    // @ts-ignore
    return (...args) => this.run(data, () => callback(...args));
  }

  withData(data: Value) {
    return {
      run: <Fn extends AnyFunction>(callback: Fn) => {
        return this.run(data, callback);
      },
      wrap: <Fn extends AnyFunction>(callback: Fn) => {
        return this.wrap(data, callback);
      },
    }
  }
}