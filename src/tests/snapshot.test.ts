import { AsyncContext } from '..';
import { AsyncSnapshot } from '../lib/AsyncSnapshot';
import { wait } from './_lib';

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
      expect(asyncContext.get()).toBe('Inner');
      expect(asyncContext2.get()).toBe('Inner 2');
    });
  })

  it('should keep have access to data even if variable is disposed', async () => {
    const asyncContext = new AsyncContext.Variable();
    const asyncContext2 = new AsyncContext.Variable();

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

    asyncContext.dispose();
    asyncContext2.dispose();

    // Ensure we don't have any reference to the original variable
    AsyncContext.Variable.all.forEach((variable) => {
      expect(variable).not.toBe(asyncContext);
      expect(variable).not.toBe(asyncContext2);
    })

    snapshot.run(() => {
      expect(asyncContext.get()).toBe('Inner');
      expect(asyncContext2.get()).toBe('Inner 2');
    });
  })
})

