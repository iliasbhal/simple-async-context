import { AsyncContext } from '../../src';
import { Polyfill } from '../../src/polyfills';

const context = new AsyncContext.Variable();

const wait = (timeout) => new Polyfill.OriginalPromise(r => Polyfill.originalSetTimeout(r, timeout));

let fill = true;
(async () => {
  while (fill) {
    console.log('-> before fill', context.get());
    const ctx = AsyncContext.extend()
    console.log('-> before fill wait', context.get());
    await wait(0)
    console.log('-> after fill wait', context.get());
    ctx.undo()
    console.log('-> after fill', context.get());
    // ctx.reset();
  }
})()

const main = async () => {
  const innerCallback = context.withData('Inner').wrap(async () => {
    console.log(context.get() === 'Inner', 1, 'Inner');
    await wait(0);
    console.log(context.get() === 'Inner', 2, 'Inner');
  });


  const total = context.withData('Outer').wrap(async () => {
    console.log(context.get() === 'Outer', 1, 'Outer');
    await innerCallback();
    console.log(context.get() === 'Outer', 2, 'Outer');
  });


  await total()
  fill = false;
}

main();