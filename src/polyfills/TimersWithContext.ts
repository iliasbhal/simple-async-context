import { createCallbackWithContext } from './createCallbackWithContext';

export const timers = {
  setTimeout: createCallbackWithContext(setTimeout),
  setInterval: createCallbackWithContext(setInterval),
  setImmediate: createCallbackWithContext(setImmediate),
};
