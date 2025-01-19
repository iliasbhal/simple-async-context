
import { Polyfill } from '../polyfills';

export const wait = (timeout: number) => new Promise((resolve) => Polyfill.originalSetTimeout(resolve, timeout))