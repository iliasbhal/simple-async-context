import wait from 'wait';
import { SimpleAsyncContext, enableAsyncContext } from '.';

enableAsyncContext();

describe('SimpleAsyncContext', () => {
  it('sync (scenario 1): should know in which context it is', () => {

    const deepInnerWrapperCallback = () => {
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      const value = deepInnerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      return value
    }
    const deepInnerCallback = SimpleAsyncContext.wrap('DeepInner', () => {
      expect(SimpleAsyncContext.getId()).toBe('DeepInner');
      return 'DEEP'
    })

    const innerCallback = SimpleAsyncContext.wrap('Inner', () => {
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      const deep = deepInnerWrapperCallback();
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      return 'INNER' + ' ' + deep;
    });

    const silblingCallback = SimpleAsyncContext.wrap('Silbling', () => {
      expect(SimpleAsyncContext.getId()).toBe('Silbling');
      return 'SILBLING'
    })

    const total = SimpleAsyncContext.wrap('Outer', () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const inner = innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return 'OUTER' + ' ' + inner;
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    expect(silblingCallback()).toBe('SILBLING');
    expect(SimpleAsyncContext.getId()).toBe(undefined);
    expect(total()).toBe('OUTER INNER DEEP');
    expect(SimpleAsyncContext.getId()).toBe(undefined);
    expect(silblingCallback()).toBe('SILBLING');
    expect(SimpleAsyncContext.getId()).toBe(undefined);
  })

  it('async (scenario 1): should know in which context it is', async () => {
    const innerCallback = SimpleAsyncContext.wrap('Inner', () => {
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      return 'INNER'
    });

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value = innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER ${value}`;
    });

    await expect(total()).resolves.toBe('OUTER INNER');
  })

  it('async (scenario 2): should know in which context it is', async () => {

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER`;
    });

    const value = await total();
    expect(value).toBe('OUTER');
  })


  it('async (scenario 3): should know in which context it is', async () => {
    const total = SimpleAsyncContext.wrap('Outer', async () => {
      // console.log(SimpleAsyncContext.getId());
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      await wait(100);
      // console.log(SimpleAsyncContext.getId());
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      await wait(100);
      // console.log(SimpleAsyncContext.getId());
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER`;
    });

    const value = await total();
    expect(value).toBe('OUTER');
  })




  it('async (scenario 4): should know in which context it is', async () => {
    const innerCallback = async () => {
      // console.log('\t -> Inner Content', SimpleAsyncContext.getStackId());
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return 'INNER'
    };

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = await innerCallback();


      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());

      expect(SimpleAsyncContext.getId()).toBe('Outer');
      // console.log('Outer End');
      return `OUTER ${value}`;
    });


    expect(SimpleAsyncContext.getId()).toBe(undefined);

    // console.log('\t -> Before All', SimpleAsyncContext.getStackId());
    const value = await total();

    expect(SimpleAsyncContext.getId()).toBe(undefined);

    // console.log('\t -> After All', SimpleAsyncContext.getStackId());
    expect(value).toBe('OUTER INNER');
  })

  it('async (scenario 5): should know in which context it is', async () => {
    const innerCallback = async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return 'INNER'
    };

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    await total();
    expect(SimpleAsyncContext.getId()).toBe(undefined);
    // expect(value).toBe('OUTER INNER INNER INNER');
  })

  it('async (scenario 6): should know in which context it is', async () => {
    const deepCallback = async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return 'DEEP'
    }

    const innerCallback = async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');

      const value = await deepCallback();

      expect(SimpleAsyncContext.getId()).toBe('Outer');

      return `INNER ${value}`
    };

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    await total();
    expect(SimpleAsyncContext.getId()).toBe(undefined);
  })


  it('async (scenario 7): should know in which context it is', async () => {
    const deepCallback = async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');

      await wait(100);

      expect(SimpleAsyncContext.getId()).toBe('Outer');

      return 'DEEP'
    }

    const innerCallback = async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('Outer');

      const value = await deepCallback();

      expect(SimpleAsyncContext.getId()).toBe('Outer');
      await wait(100);

      expect(SimpleAsyncContext.getId()).toBe('Outer');

      return `INNER ${value}`
    };

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    await total();
    expect(SimpleAsyncContext.getId()).toBe(undefined);
  })


  it('async (scenario 8): should know in which context it is', async () => {

    const deepCallback = async () => {
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      return 'DEEP'
    }

    const innerCallback = SimpleAsyncContext.wrap('Inner', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      const value = await deepCallback();
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      return `INNER ${value}`
    });

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    await total();
    expect(SimpleAsyncContext.getId()).toBe(undefined);
  })

  it('async (scenario 9): should know in which context it is', async () => {
    const track1 = SimpleAsyncContext.wrap('track1', async () => {
      expect(SimpleAsyncContext.getId()).toBe('track1');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('track1');
    });

    const track2 = SimpleAsyncContext.wrap('track2', async () => {
      expect(SimpleAsyncContext.getId()).toBe('track2');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('track2');
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);

    track1();
    track2();

    await wait(1000)
    expect(SimpleAsyncContext.getId()).toBe(undefined);
  })

  it('async (scenario 9/bis): should know in which context it is', async () => {
    const track1 = SimpleAsyncContext.wrap('track1', async () => {
      expect(SimpleAsyncContext.getId()).toBe('track1');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('track1');
    });

    const track2 = SimpleAsyncContext.wrap('track2', async () => {
      expect(SimpleAsyncContext.getId()).toBe('track2');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('track2');
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);

    track1();
    await wait(30)
    track2();

    await wait(1000)
    expect(SimpleAsyncContext.getId()).toBe(undefined);
  })

  it('async (scenario 9/bis/bis): should know in which context it is', async () => {
    const track1 = SimpleAsyncContext.wrap('track1', async () => {
      expect(SimpleAsyncContext.getId()).toBe('track1');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('track1');
    });

    const track2 = SimpleAsyncContext.wrap('track2', async () => {
      expect(SimpleAsyncContext.getId()).toBe('track2');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('track2');
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);

    track1().then(() => {
      expect(SimpleAsyncContext.getId()).toBe(undefined);
    });

    await wait(30)
    track2().then(() => {
      expect(SimpleAsyncContext.getId()).toBe(undefined);
    });;

    await wait(1000)
    expect(SimpleAsyncContext.getId()).toBe(undefined);
  })

  it('async (scenario 9/bis/bis/bis): should know in which context it is', async () => {

    const track1 = SimpleAsyncContext.wrap('track1', async () => {
      expect(SimpleAsyncContext.getId()).toBe('track1');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('track1');
    });

    const track2 = SimpleAsyncContext.wrap('track2', async () => {
      expect(SimpleAsyncContext.getId()).toBe('track2');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('track2');
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);

    let trackedAsyncId = false;
    SimpleAsyncContext.run('Random Wrap', async () => {
      track1().then(() => {
        trackedAsyncId = SimpleAsyncContext.getId();
      });
    })

    // await wait(30)

    let trackedAsyncId2 = false;
    track2().then(() => {
      trackedAsyncId2 = SimpleAsyncContext.getId();
    });;

    await wait(1000)
    expect(trackedAsyncId).toBe('Random Wrap');
    expect(trackedAsyncId2).toBe(undefined);
    expect(SimpleAsyncContext.getId()).toBe(undefined);
  })

  it('async (scenario 10): should know in which context it is', async () => {
    const innerCallback = SimpleAsyncContext.wrap('Inner', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      return `INNER`
    });

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER ${value}`;
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    const results = await Promise.all([
      total(),
      total(),
    ]);

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    expect(results).toEqual(['OUTER INNER', 'OUTER INNER']);
  })

  it('async (scenario 11): should know in which context it is', async () => {
    const innerCallback = SimpleAsyncContext.wrap('Inner', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      // console.log(SimpleAsyncContext.getStackId())
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getId()).toBe('Inner');
      return `INNER`
    });

    const inner2Callback = SimpleAsyncContext.wrap('Inner2', async () => {

      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getId()).toBe('Inner2');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getId()).toBe('Inner2');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getId()).toBe('Inner2');
      return `INNER2`
    });

    const total = SimpleAsyncContext.wrap('Outer', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value2 = await inner2Callback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer');
      return `OUTER ${value}`;
    });

    const total2 = SimpleAsyncContext.wrap('Outer 2', async () => {
      expect(SimpleAsyncContext.getId()).toBe('Outer 2');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer 2');
      const value2 = await inner2Callback();
      expect(SimpleAsyncContext.getId()).toBe('Outer 2');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getId()).toBe('Outer 2');
      return `OUTER2 ${value2}`;
    });

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    const results = await Promise.all([
      total(),
      total2(),
      total(),
      total2(),
    ]);

    expect(SimpleAsyncContext.getId()).toBe(undefined);
    expect(results).toEqual(['OUTER INNER', 'OUTER2 INNER2', 'OUTER INNER', 'OUTER2 INNER2']);
  })
})
