import { AsyncStack } from '../polyfills/AsyncStack';
import { AsyncVariable } from './AsyncVariable'
import { AsyncSnapshot } from './AsyncSnapshot';

export class AsyncContext {
  static Root = AsyncStack.getCurrent();

  static Variable = AsyncVariable;
  static Snapshot = AsyncSnapshot;

  static runInFork(callback: Function) {
    let result

    new Promise((resolve) => {
      result = callback();
      resolve(result);
    })

    return result;
  }
}

