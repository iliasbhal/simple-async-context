import wait from 'wait';
import { AsyncContext } from '..';

const asyncContext = new AsyncContext.Variable();

describe('SimpleAsyncContext / Async', () => {

  it('async (scenario 1): should know in which context it is', async () => {
    const innerCallback = asyncContext.withData('Inner').wrap(() => {
      expect(asyncContext.get()).toBe('Inner');
      return 'INNER'
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      const value = innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER ${value}`;
    });

    await expect(total()).resolves.toBe('OUTER INNER');
  })

  it('async (scenario 2): should know in which context it is', async () => {

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      await wait(100);
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER`;
    });

    const value = await total();
    expect(value).toBe('OUTER');
  })


  it('async (scenario 3): should know in which context it is', async () => {
    const total = asyncContext.withData('Outer').wrap(async () => {
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe('Outer');
      await wait(100);
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe('Outer');
      await wait(100);
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER`;
    });

    const value = await total();
    expect(value).toBe('OUTER');
  })

  it('async (scenario 4): should know in which context it is', async () => {
    const innerCallback = async () => {
      // console.log('\t -> Inner Content', SimpleAsyncContext.getStackId());
      expect(asyncContext.get()).toBe('Outer');
      return 'INNER'
    };

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = await innerCallback();


      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());

      expect(asyncContext.get()).toBe('Outer');
      // console.log('Outer End');
      return `OUTER ${value}`;
    });


    expect(asyncContext.get()).toBe(undefined);

    // console.log('\t -> Before All', SimpleAsyncContext.getStackId());
    const value = await total();

    expect(asyncContext.get()).toBe(undefined);

    // console.log('\t -> After All', SimpleAsyncContext.getStackId());
    expect(value).toBe('OUTER INNER');
  })

  it('async (scenario 5): should know in which context it is', async () => {
    const innerCallback = async () => {
      expect(asyncContext.get()).toBe('Outer');
      return 'INNER'
    };

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      const value = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    await total();
    expect(asyncContext.get()).toBe(undefined);
    // expect(value).toBe('OUTER INNER INNER INNER');
  })

  it('async (scenario 6): should know in which context it is', async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe('Outer');
      return 'DEEP'
    }

    const innerCallback = async () => {
      expect(asyncContext.get()).toBe('Outer');

      const value = await deepCallback();

      expect(asyncContext.get()).toBe('Outer');

      return `INNER ${value}`
    };

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      const value = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    await total();
    expect(asyncContext.get()).toBe(undefined);
  })


  it('async (scenario 7): should know in which context it is', async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe('Outer');

      await wait(100);

      expect(asyncContext.get()).toBe('Outer');

      return 'DEEP'
    }

    const innerCallback = async () => {
      expect(asyncContext.get()).toBe('Outer');
      await wait(100);
      expect(asyncContext.get()).toBe('Outer');

      const value = await deepCallback();

      expect(asyncContext.get()).toBe('Outer');
      await wait(100);

      expect(asyncContext.get()).toBe('Outer');

      return `INNER ${value}`
    };

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      const value = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    await total();
    expect(asyncContext.get()).toBe(undefined);
  })


  it('async (scenario 8): should know in which context it is', async () => {

    const deepCallback = async () => {
      expect(asyncContext.get()).toBe('Inner');
      await wait(100);
      expect(asyncContext.get()).toBe('Inner');
      return 'DEEP'
    }

    const innerCallback = asyncContext.withData('Inner').wrap(async () => {
      expect(asyncContext.get()).toBe('Inner');
      await wait(100);
      expect(asyncContext.get()).toBe('Inner');
      const value = await deepCallback();
      expect(asyncContext.get()).toBe('Inner');
      await wait(100);
      expect(asyncContext.get()).toBe('Inner');
      return `INNER ${value}`
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      const value = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    await total();
    expect(asyncContext.get()).toBe(undefined);
  })

  it('async (scenario 9): should know in which context it is', async () => {
    const track1 = asyncContext.withData('track1').wrap(async () => {
      expect(asyncContext.get()).toBe('track1');
      await wait(100);
      expect(asyncContext.get()).toBe('track1');
    });

    const track2 = asyncContext.withData('track2').wrap(async () => {
      expect(asyncContext.get()).toBe('track2');
      await wait(100);
      expect(asyncContext.get()).toBe('track2');
    });

    expect(asyncContext.get()).toBe(undefined);

    track1();
    track2();

    await wait(1000)
    expect(asyncContext.get()).toBe(undefined);
  })

  it('async (scenario 9/bis): should know in which context it is', async () => {
    const track1 = asyncContext.withData('track1').wrap(async () => {
      expect(asyncContext.get()).toBe('track1');
      await wait(100);
      expect(asyncContext.get()).toBe('track1');
    });

    const track2 = asyncContext.withData('track2').wrap(async () => {
      expect(asyncContext.get()).toBe('track2');
      await wait(100);
      expect(asyncContext.get()).toBe('track2');
    });

    expect(asyncContext.get()).toBe(undefined);

    track1();
    await wait(30)
    track2();

    await wait(1000)
    expect(asyncContext.get()).toBe(undefined);
  })

  it('async (scenario 9/bis/bis): should know in which context it is', async () => {
    const track1 = asyncContext.withData('track1').wrap(async () => {
      expect(asyncContext.get()).toBe('track1');
      await wait(100);
      expect(asyncContext.get()).toBe('track1');
    });

    const track2 = asyncContext.withData('track2').wrap(async () => {
      expect(asyncContext.get()).toBe('track2');
      await wait(100);
      expect(asyncContext.get()).toBe('track2');
    });

    expect(asyncContext.get()).toBe(undefined);

    track1().then(() => {
      expect(asyncContext.get()).toBe(undefined);
    });

    await wait(30)
    track2().then(() => {
      expect(asyncContext.get()).toBe(undefined);
    });;

    await wait(1000)
    expect(asyncContext.get()).toBe(undefined);
  })

  it('async (scenario 9/bis/bis/bis): should know in which context it is', async () => {

    const track1 = asyncContext.withData('track1').wrap(async () => {
      expect(asyncContext.get()).toBe('track1');
      await wait(100);
      expect(asyncContext.get()).toBe('track1');
    });

    const track2 = asyncContext.withData('track2').wrap(async () => {
      expect(asyncContext.get()).toBe('track2');
      await wait(100);
      expect(asyncContext.get()).toBe('track2');
    });

    expect(asyncContext.get()).toBe(undefined);

    let trackedAsyncData: any = {};
    asyncContext.withData('Random Wrap').run(async () => {
      track1().then(() => {
        trackedAsyncData = asyncContext.get();
      });
    })

    // await wait(30)

    let trackedAsyncData2: any = {};
    track2().then(() => {
      trackedAsyncData2 = asyncContext.get();;
    });;

    await wait(1000)

    // expect(trackedAsyncData).toBe('Random Wrap');
    // expect(trackedAsyncData2).toBe(undefined);
    // expect(asyncContext.get()).toBe(undefined);
  })

  it('async (scenario 10): should know in which context it is', async () => {
    const innerCallback = asyncContext.withData('Inner').wrap(async () => {
      expect(asyncContext.get()).toBe('Inner');
      await wait(100);
      expect(asyncContext.get()).toBe('Inner');
      await wait(100);
      expect(asyncContext.get()).toBe('Inner');
      return `INNER`
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      const value = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER ${value}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    const results = await Promise.all([
      total(),
      total(),
    ]);

    expect(asyncContext.get()).toBe(undefined);
    expect(results).toEqual(['OUTER INNER', 'OUTER INNER']);
  })

  it('async (scenario 11): should know in which context it is', async () => {
    const innerCallback = asyncContext.withData('Inner').wrap(async () => {
      expect(asyncContext.get()).toBe('Inner');
      // console.log(SimpleAsyncContext.getStackId())
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe('Inner');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe('Inner');
      return `INNER`
    });

    const inner2Callback = asyncContext.withData('Inner2').wrap(async () => {

      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe('Inner2');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe('Inner2');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe('Inner2');
      return `INNER2`
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer');
      const value = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      const value2 = await inner2Callback();
      expect(asyncContext.get()).toBe('Outer');
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer');
      return `OUTER ${value}`;
    });

    const total2 = asyncContext.withData('Outer 2').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer 2');
      const value = await innerCallback();
      expect(asyncContext.get()).toBe('Outer 2');
      const value2 = await inner2Callback();
      expect(asyncContext.get()).toBe('Outer 2');
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe('Outer 2');
      return `OUTER2 ${value2}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    const results = await Promise.all([
      total(),
      total2(),
      total(),
      total2(),
    ]);

    expect(asyncContext.get()).toBe(undefined);
    expect(results).toEqual(['OUTER INNER', 'OUTER2 INNER2', 'OUTER INNER', 'OUTER2 INNER2']);
  })
});