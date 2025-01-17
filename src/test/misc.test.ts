import wait from 'wait';
import { AsyncContext } from '..';

const asyncContext = new AsyncContext.Variable();

describe('AsyncContext / Data', () => {

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