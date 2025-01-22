import { AsyncStack } from "./AsyncStack";
import { runInStack } from "./createHofWithContext";

const originalAddEventListerner = EventTarget.prototype.addEventListener;
const originalDispatchEvent = EventTarget.prototype.dispatchEvent;

const globalStack = AsyncStack.getCurrent();

const stackByEvent = new Map<Event, AsyncStack>();

export const dispatchWithContext: typeof originalDispatchEvent = function (event) {
  const stack = AsyncStack.getCurrent();
  stackByEvent.set(event, stack);
  return originalDispatchEvent.call(this, event);
}

export const addEventListenerWithContext: typeof originalAddEventListerner = function (event, callback, options) {
  const wrappedCallback: typeof callback = function (event) {
    const stackWhenDispatched = stackByEvent.get(event) || globalStack;
    return runInStack(stackWhenDispatched, () => {
      // @ts-ignore
      return callback.call(this, event)
    });
  }

  return originalAddEventListerner.call(this, event, wrappedCallback, options);
}
