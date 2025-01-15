import { PromiseWithContext } from './PromiseWithContext'

let enabled = false;

export const enableAsyncContext = () => {
  if (enabled) return;
  enabled = true;

  const root = (typeof global !== 'undefined' && global) ||
    (typeof window !== 'undefined' && window)

  // @ts-ignore
  root.Promise = PromiseWithContext;
}