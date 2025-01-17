import { createCallbackWithContext } from './createCallbackWithContext'

const originalAddEventListener = EventTarget.prototype.addEventListener;
const callbackWithContext = createCallbackWithContext(originalAddEventListener);

export const addEventListenerWithContext = function (type, cb, options) {
  return originalAddEventListener.call(this, type, callbackWithContext(cb), options);
};