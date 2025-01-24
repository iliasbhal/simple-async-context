import { AsyncContext } from "..";
import { Polyfill } from "../polyfill/Polyfill";
import { captureAsyncContexts, createRecursive, wait } from "./_lib";
import { withContext } from "../polyfill/_lib";
import { AsyncVariable } from "../lib/AsyncVariable";
import { AsyncStack } from "../polyfill/AsyncStack";

const asyncContext = new AsyncContext.Variable();

describe("Misc", () => {
  describe("Misc / Data", () => {
    const values = [null, undefined, 0, false];
    values.forEach((value) => {
      it(`should accept ${value} as data`, async () => {
        await testContextData(value);
      });
    });

    it(`should point to the original data`, async () => {
      await testContextData(Symbol("test"));
    });
  });

  describe("EventTarget", () => {
    const eventTarget = new EventTarget();
    const context = new AsyncContext.Variable();
    const context2 = new AsyncContext.Variable();

    const eventName = "test-event";
    const contextData = "test-context-data";
    const eventListenerSpy = jest.fn();

    const eventListener = (event) => {
      const value = context.get();
      eventListenerSpy(value);
    };

    context.run("noise", () => {
      context2.run("noise", () => {
        eventTarget.addEventListener(eventName, eventListener);
      });
    });

    it("should be able to track context within an event listener", async () => {
      const prevStack = AsyncStack.getCurrent();

      await context.run(contextData, async () => {
        eventTarget.dispatchEvent(new Event(eventName));
        eventTarget.dispatchEvent(new Event(eventName));
        eventTarget.dispatchEvent(new Event(eventName));
      });

      const afterStack = AsyncStack.getCurrent();

      expect(prevStack).toBe(afterStack);
      await wait(100);

      expect(eventListenerSpy).toHaveBeenCalledTimes(3);
      eventListenerSpy.mock.calls.forEach(([value]) => {
        expect(value).toBe(contextData);
      });

      eventListenerSpy.mockClear();
    });

    it("should be able to removeEventListener", async () => {
      eventTarget.removeEventListener(eventName, eventListener);

      expect(eventListenerSpy).toHaveBeenCalledTimes(0);
      eventListenerSpy.mockClear();
    });
  });

  describe("withContext", () => {
    it("should propagate `this`", () => {
      const wrapped = withContext(function () {
        expect(this).toBe("test");
      });

      wrapped.call("test");
    });

    it('return a Promises', async () => {
      const createPromise = async () => {
        await wait(1000);
        return true;
      };

      const promise = createPromise();

      expect(promise instanceof Promise).toBe(true);
      await expect(promise).resolves.toBe(true)
    })
  });

  it("traces back to root context in sync", () => {
    const DEEPNESS = 10;
    const currentStack = captureAsyncContexts();
    const unfoldAsyncStack = createRecursive({
      async: false,
      deepness: DEEPNESS,
      callback: captureAsyncContexts,
    });

    const stackTrace = unfoldAsyncStack();
    expect(stackTrace.length).toEqual(currentStack.length);

    const topmostStask = stackTrace[stackTrace.length - 1];
    expect(topmostStask).toEqual(AsyncStack.Global);
  });

  it("traces back to root context in async", async () => {
    const DEEPNESS = 10;
    const currentStack = captureAsyncContexts();
    const unfoldAsyncStack = createRecursive({
      async: true,
      deepness: DEEPNESS,
      callback: captureAsyncContexts,
    });

    const stackTrace = await unfoldAsyncStack();
    expect(stackTrace.length).toEqual(DEEPNESS + currentStack.length);

    const topmostStask = stackTrace[stackTrace.length - 1];
    expect(topmostStask).toEqual(AsyncStack.Global);
  });

  it("should cache variable when traversing deep stack", async () => {
    const context = new AsyncContext.Variable();
    const spy = jest.spyOn(AsyncVariable.prototype, "getBox" as any);

    const calls = [];
    const recursiveContextCallback = async (
      remainaingRecusrsiveSteps: number,
    ) => {
      if (remainaingRecusrsiveSteps === 0) {
        context.get();
        calls.push(spy.mock.calls.length);
        spy.mockClear();

        context.get();
        calls.push(spy.mock.calls.length);
        spy.mockClear();
        return;
      }

      await recursiveContextCallback(remainaingRecusrsiveSteps - 1);
    };

    await context.run("A", async () => {
      await recursiveContextCallback(10);
    });

    expect(calls[0]).toBeGreaterThanOrEqual(10);
    expect(calls[1]).toBe(1);
    expect(calls).toHaveLength(2);
    // expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should keep a reference to the original setTimeout", () => {
    expect(Polyfill.originalSetTimeout === setTimeout).toBe(false);
  });

  it("example from readme should work", async () => {
    const context = new AsyncContext.Variable();

    const wait = (timeout: number) =>
      new Promise((r) => setTimeout(r, timeout));
    const randomTimeout = () => Math.random() * 200;

    async function main() {
      expect(context.get()).toBe("top");

      await wait(randomTimeout());

      context.run("A", () => {
        expect(context.get()).toBe("A");

        setTimeout(() => {
          expect(context.get()).toBe("A");
        }, randomTimeout());

        context.run("B", async () => {
          // contexts can be nested.
          await wait(randomTimeout());

          expect(context.get()).toBe("B");

          expect(context.get()).toBe("B"); // contexts are restored )

          setTimeout(() => {
            expect(context.get()).toBe("B");
          }, randomTimeout());
        });

        context.run("C", async () => {
          // contexts can be nested.
          await wait(randomTimeout());

          expect(context.get()).toBe("C");

          await wait(randomTimeout());

          expect(context.get()).toBe("C");

          setTimeout(() => {
            expect(context.get()).toBe("C");
          }, randomTimeout());
        });
      });

      await wait(randomTimeout());

      expect(context.get()).toBe("top");
    }

    await context.run("top", main);

    await wait(1000);
  });
});

const testContextData = async (contextData: any) => {
  const deepInnerWrapperCallback = async () => {
    expect(asyncContext.get()).toEqual(contextData);
    await wait(100);
    expect(asyncContext.get()).toEqual(contextData);
  };

  const innerCallback = asyncContext.wrap(contextData, async () => {
    await deepInnerWrapperCallback();
    await wait(100);
    await deepInnerWrapperCallback();
  });

  const total = asyncContext.wrap("Outer", async () => {
    await innerCallback();
  });

  const innerCallback2 = asyncContext.wrap(contextData, async () => {
    await deepInnerWrapperCallback();
    await wait(100);
    await deepInnerWrapperCallback();
  });

  const total2 = asyncContext.wrap("Outer2", async () => {
    await innerCallback2();
  });

  await Promise.all([total(), total2()]);
};
