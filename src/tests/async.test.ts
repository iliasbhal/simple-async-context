import { AsyncStack } from "../lib/AsyncStack";
import { Polyfill } from '../polyfills';

Polyfill.ensureEnabled();

const unfoldAsyncStack = () => {
  const stack = AsyncStack.getCurrent();
  const stackTrace: AsyncStack[] = [stack];

  while (true) {
    const lastStack = stackTrace[stackTrace.length - 1];
    if (!lastStack?.origin) break;
    console.log('lastStack', lastStack);
    stackTrace.push(lastStack);
  }

  return stackTrace;
}

describe('Core', () => {

  it('traces back to root context', async () => {
    const stacks = unfoldAsyncStack();
    console.log('stacks', stacks);
    const topmostStask = stacks[stacks.length - 1];
    expect(topmostStask).toBe(AsyncStack.Global);

  })

});