import { createHofWithContext } from './createHofWithContext';

export const timers = {
  setTimeout: createHofWithContext(setTimeout),
  setInterval: createHofWithContext(setInterval),
  setImmediate: createHofWithContext(setImmediate),
};
