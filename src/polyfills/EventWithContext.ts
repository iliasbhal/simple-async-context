import { createHofWithContext } from './createHofWithContext'

const originalAddEventListener = EventTarget.prototype.addEventListener;
const callbackWithContext = createHofWithContext(originalAddEventListener);

export const addEventListenerWithContext = function (type, cb, options) {
  return originalAddEventListener.call(this, type, callbackWithContext(cb), options);
};