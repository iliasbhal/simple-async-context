import { AsyncContext } from "..";

const asyncContext = new AsyncContext.Variable();

describe("SimpleAsyncContext / Sync", () => {
  it("runs the callback", () => {
    const spy = jest.fn();

    asyncContext.run("Silbling", () => {
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockClear();
  });

  it("sync (scenario 1): should know in which context it is", () => {
    const spy = jest.fn();
    const silblingCallback = asyncContext.wrap("Silbling", () => {
      spy();
      expect(asyncContext.get()).toBe("Silbling");
    });

    expect(asyncContext.get()).toBe(undefined);

    silblingCallback();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockClear();

    expect(asyncContext.get()).toBe(undefined);

    silblingCallback();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockClear();

    expect(asyncContext.get()).toBe(undefined);
  });

  it("sync (scenario 2): should know in which context it is", async () => {
    const deepInnerCallback = asyncContext.wrap("DeepInner", () => {
      expect(asyncContext.get()).toBe("DeepInner");
      return "DEEP";
    });

    const deepInnerWrapperCallback = async () => {
      // <-- this is an async function
      expect(asyncContext.get()).toBe("Inner");
      const value = deepInnerCallback();
      expect(asyncContext.get()).toBe("Inner");
      return value;
    };

    const innerCallback = asyncContext.wrap("Inner", () => {
      expect(asyncContext.get()).toBe("Inner");
      deepInnerWrapperCallback();
      expect(asyncContext.get()).toBe("Inner");
      return "INNER";
    });

    const total = asyncContext.wrap("Outer", () => {
      expect(asyncContext.get()).toBe("Outer");
      const inner = innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return "OUTER" + " " + inner;
    });

    expect(total()).toBe("OUTER INNER");
  });

  it("sync (scenario 3): should know in which context it is", () => {
    const deepInnerWrapperCallback = () => {
      expect(asyncContext.get()).toBe("Inner");
      const value = deepInnerCallback();
      expect(asyncContext.get()).toBe("Inner");
      return value;
    };
    const deepInnerCallback = asyncContext.wrap("DeepInner", () => {
      expect(asyncContext.get()).toBe("DeepInner");
      return "DEEP";
    });

    const innerCallback = asyncContext.wrap("Inner", () => {
      expect(asyncContext.get()).toBe("Inner");
      const deep = deepInnerWrapperCallback();
      expect(asyncContext.get()).toBe("Inner");
      return "INNER" + " " + deep;
    });

    const silblingCallback = asyncContext.wrap("Silbling", () => {
      expect(asyncContext.get()).toBe("Silbling");
      return "SILBLING";
    });

    const total = asyncContext.wrap("Outer", () => {
      expect(asyncContext.get()).toBe("Outer");
      const inner = innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return "OUTER" + " " + inner;
    });

    expect(asyncContext.get()).toBe(undefined);
    expect(silblingCallback()).toBe("SILBLING");
    expect(asyncContext.get()).toBe(undefined);
    expect(total()).toBe("OUTER INNER DEEP");
    expect(asyncContext.get()).toBe(undefined);
    expect(silblingCallback()).toBe("SILBLING");
    expect(asyncContext.get()).toBe(undefined);
  });
});
