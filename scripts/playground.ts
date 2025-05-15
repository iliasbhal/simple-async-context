import { AsyncContext } from '../src';
import { Polyfill } from '../src/polyfill/Polyfill';

const context = new AsyncContext.Variable();
const wait = (timeout) => new Promise(r => Polyfill.originalSetTimeout(r, timeout));

const randomTimeout = () => Math.random() * 300;

export const example = async () => {


  console.log(context.get() === 'top')

  await wait(randomTimeout());

  context.run("A", () => {
    console.log(context.get() === 'A')

    setTimeout(() => {
      console.log(context.get() === 'A')
    }, randomTimeout());

    context.run("B", async () => { // contexts can be nested.
      await wait(randomTimeout());

      console.log(context.get() === 'B')

      console.log(context.get() === 'B')  // contexts are restored 

      setTimeout(() => {
        console.log(context.get() === 'B')
      }, randomTimeout());
    });


    context.run("C", async () => { // contexts can be nested.
      await wait(randomTimeout());

      console.log(context.get() === 'C')

      await wait(randomTimeout());

      console.log(context.get() === 'C')

      setTimeout(() => {
        console.log(context.get() === 'C')
      }, randomTimeout());
    });

  });

  await wait(randomTimeout());

  console.log(context.get() === 'top');

};

const main = () => {
  context.run('top', example)
}

Promise.resolve()
  .then(() => console.log("START"))
  .then(() => main())
  .then(() => console.log("DONE"))
  .catch((err) => console.log(err, "ERROR"));
