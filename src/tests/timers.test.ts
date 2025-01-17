import wait from 'wait';
import { AsyncContext } from '..';

const asyncContext = new AsyncContext.Variable();

describe('AsyncContext / setTimeout', () => {
  it('should not infere with timers', async () => {

    const before = Date.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const after = Date.now();
    const timeSpent = after - before;
    expect(timeSpent).toBeGreaterThanOrEqual(100);

  });

  it('timer (scenario 1): should know in which context it is', async () => {

    const innerCallback = asyncContext.withData('Inner').wrap(async () => {
      setTimeout(() => expect(asyncContext.get()).toBe('Inner'), 0)
      setTimeout(() => expect(asyncContext.get()).toBe('Inner'), 10)
      setTimeout(() => expect(asyncContext.get()).toBe('Inner'), 150)
      await wait(100);
      setTimeout(() => expect(asyncContext.get()).toBe('Inner'), 0)
      setTimeout(() => expect(asyncContext.get()).toBe('Inner'), 100)
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      setTimeout(() => expect(asyncContext.get()).toBe('Outer'), 0)
      setTimeout(() => expect(asyncContext.get()).toBe('Outer'), 10)
      setTimeout(() => expect(asyncContext.get()).toBe('Outer'), 150)
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = await innerCallback();

      setTimeout(() => expect(asyncContext.get()).toBe('Outer'), 0)
      setTimeout(() => expect(asyncContext.get()).toBe('Outer'), 100)
      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());
      // console.log('Outer End');
      return `OUTER ${value}`;
    });

    await total();
    await wait(1000)

  });


  it('timer (scenario 2): should know in which context it is', async () => {

    const innerCallback = asyncContext.withData('Inner').wrap(async () => {
      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe('Inner')
        }, 0)
      }, 0)
      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe('Inner')
        }, 10)
      }, 150)

      await wait(100);

      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe('Inner')
        }, 10)
      }, 150)

      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe('Inner')
        }, 0)
      }, 0)
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe('Outer')
        }, 0)
      }, 0)
      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe('Outer')
        }, 10)
      }, 150)
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = await innerCallback();


      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe('Outer')
        }, 10)
      }, 150)

      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe('Outer')
        }, 0)
      }, 0)
      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());
      // console.log('Outer End');
      return `OUTER ${value}`;
    });

    await total();
    await wait(1000)
  });

  it('timer (scenario 3): should know in which context it is', async () => {


    const innerCallback = asyncContext.withData('Inner').wrap(async () => {
      setTimeout(async () => expect(asyncContext.get()).toBe('Inner'), 0)
      setTimeout(async () => {
        await wait(200);
        expect(asyncContext.get()).toBe('Inner')
      }, 10)
      setTimeout(async () => {
        await wait(100);
        expect(asyncContext.get()).toBe('Inner')
      }, 150)

      await wait(100);

      setTimeout(async () => expect(asyncContext.get()).toBe('Inner'), 0)
      setTimeout(async () => {
        await wait(200);
        expect(asyncContext.get()).toBe('Inner')
      }, 10)
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      setTimeout(async () => expect(asyncContext.get()).toBe('Outer'), 0)
      setTimeout(async () => {
        await wait(200);
        expect(asyncContext.get()).toBe('Outer')
      }, 10)
      setTimeout(async () => {
        await wait(100);
        expect(asyncContext.get()).toBe('Outer')
      }, 150)
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = await innerCallback();

      setTimeout(async () => expect(asyncContext.get()).toBe('Outer'), 0)
      setTimeout(async () => {
        await wait(200);
        expect(asyncContext.get()).toBe('Outer')
      }, 10)
      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());
      // console.log('Outer End');
      return `OUTER ${value}`;
    });

    await total();
    await wait(1000)

  })
})