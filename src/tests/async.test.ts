import { AsyncContext } from "..";
import { wait, createAsyncDebugger } from "./_lib";

const asyncContext = new AsyncContext.Variable();

describe("SimpleAsyncContext / Async", () => {
  it("async (scenario 1): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", () => {
      expect(asyncContext.get()).toBe("Inner");
      return "INNER";
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value}`;
    });

    await expect(total()).resolves.toBe("OUTER INNER");
  });

  it("async (scenario 2): should know in which context it is", async () => {
    await asyncContext.run("Outer", async () => {
      // captureAsyncContexts().forEach((ctx, i) => ctx.index = i);

      // console.log(captureAsyncContexts().map((ctx, i) => ctx.index));
      expect(asyncContext.get()).toBe("Outer");
      // console.log(captureAsyncContexts().map((ctx, i) => ctx.index));
      await wait(30);

      // console.log(captureAsyncContexts().map((ctx, i) => ctx.index));
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER`;
    });
  });

  it("async (scenario 3): should know in which context it is", async () => {
    const total = asyncContext.wrap("Outer", async () => {
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe("Outer");
      await wait(30);
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe("Outer");
      await wait(30);
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER`;
    });

    const value = await total();
    expect(value).toBe("OUTER");
  });

  it("async (scenario 4): should know in which context it is", async () => {
    const innerCallback = async () => {
      // console.log('\t -> Inner Content', SimpleAsyncContext.getStackId());
      expect(asyncContext.get()).toBe("Outer");
      return "INNER";
    };

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = await innerCallback();

      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());

      expect(asyncContext.get()).toBe("Outer");
      // console.log('Outer End');
      return `OUTER ${value}`;
    });

    expect(asyncContext.get()).toBe(undefined);

    // console.log('\t -> Before All', SimpleAsyncContext.getStackId());
    const value = await total();

    expect(asyncContext.get()).toBe(undefined);

    // console.log('\t -> After All', SimpleAsyncContext.getStackId());
    expect(value).toBe("OUTER INNER");
  });

  it("async (scenario 5): should know in which context it is", async () => {
    const innerCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");
      return "INNER";
    };

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    await total();
    expect(asyncContext.get()).toBe(undefined);
    // expect(value).toBe('OUTER INNER INNER INNER');
  });

  it("async (scenario 6): should know in which context it is", async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");
      return "DEEP";
    };

    const innerCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");

      const value = await deepCallback();

      expect(asyncContext.get()).toBe("Outer");

      return `INNER ${value}`;
    };

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    await total();
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 7): should know in which context it is", async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");

      await wait(30);

      expect(asyncContext.get()).toBe("Outer");

      return "DEEP";
    };

    const innerCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");
      await wait(30);
      expect(asyncContext.get()).toBe("Outer");

      const value = await deepCallback();

      expect(asyncContext.get()).toBe("Outer");
      await wait(30);

      expect(asyncContext.get()).toBe("Outer");

      return `INNER ${value}`;
    };

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    await total();
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 8): should know in which context it is", async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe("Inner");
      await wait(30);
      expect(asyncContext.get()).toBe("Inner");
      return "DEEP";
    };

    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      await wait(30);
      expect(asyncContext.get()).toBe("Inner");
      const value = await deepCallback();
      expect(asyncContext.get()).toBe("Inner");
      await wait(30);
      expect(asyncContext.get()).toBe("Inner");
      return `INNER ${value}`;
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    await total();
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 9): should know in which context it is", async () => {
    // const debugAsync = createAsyncDebugger('global');
    const track1 = asyncContext.wrap("track1", async () => {
      // debugAsync.debug('track1.1');

      expect(asyncContext.get()).toBe("track1");
      await wait(30);

      // debugAsync.debug('track1.2');
      expect(asyncContext.get()).toBe("track1");
    });

    const track2 = asyncContext.wrap("track2", async () => {
      // debugAsync.debug('track2.1');
      expect(asyncContext.get()).toBe("track2");
      await wait(30);

      // debugAsync.debug('track2.2');
      expect(asyncContext.get()).toBe("track2");
    });

    expect(asyncContext.get()).toBe(undefined);

    track1();
    track2();

    await wait(100);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 9/bis): should know in which context it is", async () => {
    const track1 = asyncContext.wrap("track1", async () => {
      expect(asyncContext.get()).toBe("track1");
      await wait(30);
      expect(asyncContext.get()).toBe("track1");
    });

    const track2 = asyncContext.wrap("track2", async () => {
      expect(asyncContext.get()).toBe("track2");
      await wait(30);
      expect(asyncContext.get()).toBe("track2");
    });

    expect(asyncContext.get()).toBe(undefined);

    track1();
    await wait(30);
    track2();

    await wait(100);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 9/bis/bis): should know in which context it is", async () => {
    const track1 = asyncContext.wrap("track1", async () => {
      expect(asyncContext.get()).toBe("track1");
      await wait(30);
      expect(asyncContext.get()).toBe("track1");
    });

    const track2 = asyncContext.wrap("track2", async () => {
      expect(asyncContext.get()).toBe("track2");
      await wait(30);
      expect(asyncContext.get()).toBe("track2");
    });

    expect(asyncContext.get()).toBe(undefined);

    track1().then(() => {
      expect(asyncContext.get()).toBe(undefined);
    });

    await wait(30);
    track2().then(() => {
      expect(asyncContext.get()).toBe(undefined);
    });

    await wait(100);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 9/bis/bis/bis): should know in which context it is", async () => {
    const track1 = asyncContext.wrap("track1", async () => {
      expect(asyncContext.get()).toBe("track1");
      await wait(30);
      expect(asyncContext.get()).toBe("track1");
    });

    const track2 = asyncContext.wrap("track2", async () => {
      expect(asyncContext.get()).toBe("track2");
      await wait(30);
      expect(asyncContext.get()).toBe("track2");
    });

    expect(asyncContext.get()).toBe(undefined);

    let trackedAsyncData: any = {};
    asyncContext.run('Random Wrap', async () => {
      track1().then(() => {
        trackedAsyncData = asyncContext.get();
      });
    });

    // await wait(30)

    let trackedAsyncData2: any = {};
    track2().then(() => {
      trackedAsyncData2 = asyncContext.get();
    });

    await wait(100);

    expect(trackedAsyncData).toBe("Random Wrap");
    expect(trackedAsyncData2).toBe(undefined);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 10): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      await wait(30);
      expect(asyncContext.get()).toBe("Inner");
      await wait(30);
      expect(asyncContext.get()).toBe("Inner");
      return `INNER`;
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value2 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    const results = await Promise.all([total(), total()]);

    expect(asyncContext.get()).toBe(undefined);
    expect(results).toEqual(["OUTER INNER", "OUTER INNER"]);
  });

  it("async (scenario 11): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      // console.log(SimpleAsyncContext.getStackId())
      await wait(30);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner");
      await wait(30);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner");
      return `INNER`;
    });

    const inner2Callback = asyncContext.wrap("Inner2", async () => {
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner2");
      await wait(30);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner2");
      // console.log(SimpleAsyncContext.getStackId())
      await wait(30);
      expect(asyncContext.get()).toBe("Inner2");
      return `INNER2`;
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value2 = await inner2Callback();
      expect(asyncContext.get()).toBe("Outer");
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value}`;
    });

    const total2 = asyncContext.wrap("Outer2", async () => {
      expect(asyncContext.get()).toBe("Outer2");
      const value = await innerCallback();
      expect(asyncContext.get()).toBe("Outer2");
      const value2 = await inner2Callback();
      expect(asyncContext.get()).toBe("Outer2");
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer2");
      return `OUTER2 ${value2}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    const results = await Promise.all([total(), total2(), total(), total2()]);

    expect(asyncContext.get()).toBe(undefined);
    expect(results).toEqual([
      "OUTER INNER",
      "OUTER2 INNER2",
      "OUTER INNER",
      "OUTER2 INNER2",
    ]);
  });

  it("async (scenario 12): should know in which context it is", async () => {
    const overflowInner = asyncContext.wrap("Overflow", async () => {
      expect(asyncContext.get()).toBe("Overflow");
      await wait(25);
      expect(asyncContext.get()).toBe("Overflow");
    });

    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      overflowInner();
      // console.log(SimpleAsyncContext.getStackId())
      await wait(30);
      overflowInner();
      expect(asyncContext.get()).toBe("Inner");
      await wait(30);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner");
      return `INNER`;
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value2 = await overflowInner();
      expect(asyncContext.get()).toBe("Outer");
      const value3 = await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
    });

    await total();
    await wait(80);
  });


  it("async (scenario 13): should know in which context it is", async () => {
    const overflowInner = asyncContext.wrap("Overflow", async () => {
      setTimeout(async () => {
        expect(asyncContext.get()).toBe("Overflow");
        await wait(25);
        expect(asyncContext.get()).toBe("Overflow");
      }, 100)
    });

    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      overflowInner();
      // console.log(SimpleAsyncContext.getStackId())
      await wait(30);
      overflowInner();
      expect(asyncContext.get()).toBe("Inner");
      await wait(30);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner");
    });

    await asyncContext.run("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      await overflowInner();
      expect(asyncContext.get()).toBe("Outer");
      await innerCallback();
      expect(asyncContext.get()).toBe("Outer");
    });
  });

});
