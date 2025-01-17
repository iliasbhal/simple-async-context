import wait from 'wait';
import { AsyncContext } from '..';
import { AsyncSnapshot } from '../lib/AsyncSnapshot';
import { AsyncVariable } from '../lib/AsyncVariable';

const asyncContext = new AsyncContext.Variable();
const asyncContext2 = new AsyncContext.Variable();

describe('AsyncContext / Snapshot', () => {

  it('can runs callback', () => {
    const snapshot = AsyncContext.Snapshot.create();
    const result = snapshot.run(() => 'Done');
    expect(result).toBe('Done');
  })

  it('can wraps callback', () => {
    const snapshot = AsyncContext.Snapshot.create();
    const result = snapshot.wrap(() => 'Done');
    expect(result()).toBe('Done');
  })

  it('snapshot (scenario 1): should know in which context it is', async () => {
    let snapshot: AsyncSnapshot = null;

    const innerCallback = asyncContext.withData('Inner').wrap(async () => {
      return asyncContext2.run('Inner 2', async () => {
        expect(asyncContext.get()).toBe('Inner')
        await wait(100);

        snapshot = AsyncContext.Snapshot.create()
        expect(asyncContext.get()).toBe('Inner')
      })
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      expect(asyncContext.get()).toBe('Outer')
      await innerCallback();
      expect(asyncContext.get()).toBe('Outer')
    });

    await total();

    snapshot.run(() => {
      const current = AsyncContext.getCurrent();
      console.log('current', current);
      expect(asyncContext.get()).toBe('Inner');
      expect(asyncContext2.get()).toBe('Inner 2');
    });
  })
})

