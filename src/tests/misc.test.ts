import { AsyncContext } from '..';
import { Polyfill } from '../polyfills';
import { wait } from './_lib';
import { createHofWithContext } from '../polyfills/createHofWithContext';

const asyncContext = new AsyncContext.Variable();

describe('Misc', () => {
  describe('Misc / Data', () => {

    const values = [null, undefined, 0, false];
    values.forEach(value => {
      it(`should accept ${value} as data`, async () => {
        await testContextData(value);
      });
    });

    it(`should point to the original data`, async () => {
      await testContextData(Symbol('test'));
    });
  })


  describe('createHofWithContext', () => {
    it('should propagate `this`', () => {
      const wrapped = createHofWithContext(function () {
        expect(this).toBe('test');
      });

      wrapped.call('test');
    })

  })

  it('should cache variable when traversing deep stack', async () => {
    const context = new AsyncContext.Variable();
    const spy = jest.spyOn(AsyncContext.prototype, 'getBox' as any);

    const NESTING = 10;
    const calls = [];
    const recursiveContextCallback = async (level: number, current: number = 0) => {
      if (level == current) {
        context.get();
        calls.push(spy.mock.calls.length)
        spy.mockClear();

        context.get();
        calls.push(spy.mock.calls.length)
        spy.mockClear()
        return
      }

      await recursiveContextCallback(level, current + 1);
    }

    await context.run("A", async () => {
      await recursiveContextCallback(NESTING);
    });

    expect(calls[1]).toBe(1);
    // expect(spy).toHaveBeenCalledTimes(1);
  })

  it('should keep a reference to the original setTimeout', () => {
    expect(Polyfill.originalSetTimeout === setTimeout).toBe(false)
  })

  it('example from readme should work', async () => {

    const context = new AsyncContext.Variable();



    const wait = (timeout: number) => new Promise(r => setTimeout(r, timeout));
    const randomTimeout = () => Math.random() * 200;

    async function main() {

      expect(context.get()).toBe('top')

      await wait(randomTimeout());

      context.run("A", () => {
        expect(context.get()).toBe('A')

        setTimeout(() => {
          expect(context.get()).toBe('A')
        }, randomTimeout());

        context.run("B", async () => { // contexts can be nested.
          await wait(randomTimeout());

          expect(context.get()).toBe('B')

          expect(context.get()).toBe('B')  // contexts are restored )

          setTimeout(() => {
            expect(context.get()).toBe('B')
          }, randomTimeout());
        });


        context.run("C", async () => { // contexts can be nested.
          await wait(randomTimeout());

          expect(context.get()).toBe('C')

          await wait(randomTimeout());

          expect(context.get()).toBe('C')

          setTimeout(() => {
            expect(context.get()).toBe('C')
          }, randomTimeout());
        });

      });

      await wait(randomTimeout());

      expect(context.get()).toBe('top')
    }

    await context.run("top", main);

    await wait(1000);

  })
})


const testContextData = async (contextData: any) => {
  const deepInnerWrapperCallback = async () => {
    expect(asyncContext.get()).toEqual(contextData)
    await wait(100);
    expect(asyncContext.get()).toEqual(contextData)
  }

  const innerCallback = asyncContext.withData(contextData).wrap(async () => {
    await deepInnerWrapperCallback();
    await wait(100);
    await deepInnerWrapperCallback()
  });

  const total = asyncContext.withData('Outer').wrap(async () => {
    await innerCallback();
  });

  const innerCallback2 = asyncContext.wrap(contextData, async () => {
    await deepInnerWrapperCallback();
    await wait(100);
    await deepInnerWrapperCallback()
  });

  const total2 = asyncContext.withData('Outer2').wrap(async () => {
    await innerCallback2();
  });

  await Promise.all([
    total(),
    total2(),
  ]);
}