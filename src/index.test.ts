import wait from 'wait';
import { SimpleAsyncContext, enableAsyncContext } from '.';

enableAsyncContext();

describe('SimpleAsyncContext', () => {
  it('sync (scenario 1): should know in which context it is', () => {

    const deepInnerWrapperCallback = () => {
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      const value = deepInnerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      return value
    }
    const deepInnerCallback = SimpleAsyncContext.withData('DeepInner').wrap(() => {
      expect(SimpleAsyncContext.getData()).toBe('DeepInner');
      return 'DEEP'
    })

    const innerCallback = SimpleAsyncContext.withData('Inner').wrap(() => {
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      const deep = deepInnerWrapperCallback();
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      return 'INNER' + ' ' + deep;
    });

    const silblingCallback = SimpleAsyncContext.withData('Silbling').wrap(() => {
      expect(SimpleAsyncContext.getData()).toBe('Silbling');
      return 'SILBLING'
    })

    const total = SimpleAsyncContext.withData('Outer').wrap(() => {

      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const inner = innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return 'OUTER' + ' ' + inner;
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    expect(silblingCallback()).toBe('SILBLING');
    expect(SimpleAsyncContext.getData()).toBe(undefined);
    expect(total()).toBe('OUTER INNER DEEP');
    expect(SimpleAsyncContext.getData()).toBe(undefined);
    expect(silblingCallback()).toBe('SILBLING');
    expect(SimpleAsyncContext.getData()).toBe(undefined);
  })

  it('async (scenario 1): should know in which context it is', async () => {
    const innerCallback = SimpleAsyncContext.withData('Inner').wrap(() => {
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      return 'INNER'
    });

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value = innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER ${value}`;
    });

    await expect(total()).resolves.toBe('OUTER INNER');
  })

  it('async (scenario 2): should know in which context it is', async () => {

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER`;
    });

    const value = await total();
    expect(value).toBe('OUTER');
  })


  it('async (scenario 3): should know in which context it is', async () => {
    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      // console.log(SimpleAsyncContext.getId());
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      await wait(100);
      // console.log(SimpleAsyncContext.getId());
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      await wait(100);
      // console.log(SimpleAsyncContext.getId());
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER`;
    });

    const value = await total();
    expect(value).toBe('OUTER');
  })




  it('async (scenario 4): should know in which context it is', async () => {
    const innerCallback = async () => {
      // console.log('\t -> Inner Content', SimpleAsyncContext.getStackId());
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return 'INNER'
    };

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = await innerCallback();


      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());

      expect(SimpleAsyncContext.getData()).toBe('Outer');
      // console.log('Outer End');
      return `OUTER ${value}`;
    });


    expect(SimpleAsyncContext.getData()).toBe(undefined);

    // console.log('\t -> Before All', SimpleAsyncContext.getStackId());
    const value = await total();

    expect(SimpleAsyncContext.getData()).toBe(undefined);

    // console.log('\t -> After All', SimpleAsyncContext.getStackId());
    expect(value).toBe('OUTER INNER');
  })

  it('async (scenario 5): should know in which context it is', async () => {
    const innerCallback = async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return 'INNER'
    };

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    await total();
    expect(SimpleAsyncContext.getData()).toBe(undefined);
    // expect(value).toBe('OUTER INNER INNER INNER');
  })

  it('async (scenario 6): should know in which context it is', async () => {
    const deepCallback = async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return 'DEEP'
    }

    const innerCallback = async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');

      const value = await deepCallback();

      expect(SimpleAsyncContext.getData()).toBe('Outer');

      return `INNER ${value}`
    };

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    await total();
    expect(SimpleAsyncContext.getData()).toBe(undefined);
  })


  it('async (scenario 7): should know in which context it is', async () => {
    const deepCallback = async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');

      await wait(100);

      expect(SimpleAsyncContext.getData()).toBe('Outer');

      return 'DEEP'
    }

    const innerCallback = async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('Outer');

      const value = await deepCallback();

      expect(SimpleAsyncContext.getData()).toBe('Outer');
      await wait(100);

      expect(SimpleAsyncContext.getData()).toBe('Outer');

      return `INNER ${value}`
    };

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    await total();
    expect(SimpleAsyncContext.getData()).toBe(undefined);
  })


  it('async (scenario 8): should know in which context it is', async () => {

    const deepCallback = async () => {
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      return 'DEEP'
    }

    const innerCallback = SimpleAsyncContext.withData('Inner').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      const value = await deepCallback();
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      return `INNER ${value}`
    });

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    await total();
    expect(SimpleAsyncContext.getData()).toBe(undefined);
  })

  it('async (scenario 9): should know in which context it is', async () => {
    const track1 = SimpleAsyncContext.withData('track1').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('track1');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('track1');
    });

    const track2 = SimpleAsyncContext.withData('track2').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('track2');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('track2');
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);

    track1();
    track2();

    await wait(1000)
    expect(SimpleAsyncContext.getData()).toBe(undefined);
  })

  it('async (scenario 9/bis): should know in which context it is', async () => {
    const track1 = SimpleAsyncContext.withData('track1').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('track1');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('track1');
    });

    const track2 = SimpleAsyncContext.withData('track2').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('track2');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('track2');
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);

    track1();
    await wait(30)
    track2();

    await wait(1000)
    expect(SimpleAsyncContext.getData()).toBe(undefined);
  })

  it('async (scenario 9/bis/bis): should know in which context it is', async () => {
    const track1 = SimpleAsyncContext.withData('track1').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('track1');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('track1');
    });

    const track2 = SimpleAsyncContext.withData('track2').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('track2');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('track2');
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);

    track1().then(() => {
      expect(SimpleAsyncContext.getData()).toBe(undefined);
    });

    await wait(30)
    track2().then(() => {
      expect(SimpleAsyncContext.getData()).toBe(undefined);
    });;

    await wait(1000)
    expect(SimpleAsyncContext.getData()).toBe(undefined);
  })

  it('async (scenario 9/bis/bis/bis): should know in which context it is', async () => {

    const track1 = SimpleAsyncContext.withData('track1').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('track1');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('track1');
    });

    const track2 = SimpleAsyncContext.withData('track2').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('track2');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('track2');
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);

    let trackedAsyncData: any = false;
    SimpleAsyncContext.withData('Random Wrap').run(async () => {
      track1().then(() => {
        trackedAsyncData = SimpleAsyncContext.getData();
      });
    })

    // await wait(30)

    let trackedAsyncData2: any = false;
    track2().then(() => {
      trackedAsyncData2 = SimpleAsyncContext.getData();;
    });;

    await wait(1000)
    expect(trackedAsyncData).toBe('Random Wrap');
    expect(trackedAsyncData2).toBe(undefined);
    expect(SimpleAsyncContext.getData()).toBe(undefined);
  })

  it('async (scenario 10): should know in which context it is', async () => {
    const innerCallback = SimpleAsyncContext.withData('Inner').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      await wait(100);
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      return `INNER`
    });

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value2 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER ${value}`;
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    const results = await Promise.all([
      total(),
      total(),
    ]);

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    expect(results).toEqual(['OUTER INNER', 'OUTER INNER']);
  })

  it('async (scenario 11): should know in which context it is', async () => {
    const innerCallback = SimpleAsyncContext.withData('Inner').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      // console.log(SimpleAsyncContext.getStackId())
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getData()).toBe('Inner');
      return `INNER`
    });

    const inner2Callback = SimpleAsyncContext.withData('Inner2').wrap(async () => {

      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getData()).toBe('Inner2');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getData()).toBe('Inner2');
      await wait(100);
      // console.log(SimpleAsyncContext.getStackId())
      expect(SimpleAsyncContext.getData()).toBe('Inner2');
      return `INNER2`
    });

    const total = SimpleAsyncContext.withData('Outer').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value2 = await inner2Callback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer');
      return `OUTER ${value}`;
    });

    const total2 = SimpleAsyncContext.withData('Outer 2').wrap(async () => {
      expect(SimpleAsyncContext.getData()).toBe('Outer 2');
      const value = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer 2');
      const value2 = await inner2Callback();
      expect(SimpleAsyncContext.getData()).toBe('Outer 2');
      const value3 = await innerCallback();
      expect(SimpleAsyncContext.getData()).toBe('Outer 2');
      return `OUTER2 ${value2}`;
    });

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    const results = await Promise.all([
      total(),
      total2(),
      total(),
      total2(),
    ]);

    expect(SimpleAsyncContext.getData()).toBe(undefined);
    expect(results).toEqual(['OUTER INNER', 'OUTER2 INNER2', 'OUTER INNER', 'OUTER2 INNER2']);
  })
})
