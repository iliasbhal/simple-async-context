import { createHofWithContext } from './createHofWithContext'

const originalAddEventListener = EventTarget.prototype.addEventListener;
const callbackWithContext = createHofWithContext(originalAddEventListener);

export const addEventListenerWithContext = function (...args: any[]) {
  return callbackWithContext.call(this, ...args);
};