import { AsyncContext } from "../";
import { wait, createAsyncDebugger } from "./_lib";

const asyncContext = new AsyncContext.Variable();

describe("SimpleAsyncContext / Async", () => {

  it("error (scenario 1): should know in which context it is", async () => {
    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      await wait(30);
      throw new Error("Overflow")
    });

    const result = total();
    console.log('result', result)
    await expect(total()).rejects.toThrow("Overflow");

    // try {

    //   await total();
    //   await wait(80);
    // } catch (error) {

    //   console.log('--------------------------------');
    //   console.log('asyncContext', asyncContext.get());
    //   console.log('--------------------------------');
    //   console.log('erroruuuuu', error)
    //   // expect(error).toBeInstanceOf(Error);
    //   // expect(error.message).toBe("Overflow");
    // }

    // expect(asyncContext.get()).toBe(undefined);

    // console.log('after')
  });


});
