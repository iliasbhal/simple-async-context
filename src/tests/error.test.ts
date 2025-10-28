import { AsyncContext } from "../";
import { wait, createAsyncDebugger } from "./_lib";

const asyncContext = new AsyncContext.Variable();

describe("SimpleAsyncContext / Async", () => {

  it.skip("error (scenario 1): should know in which context it is", async () => {

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      await wait(30);
      throw new Error("Overflow")
    });

    const result = total();
    console.log('result', result)
    await expect(total()).rejects.toThrow("Overflow");
  });


});
