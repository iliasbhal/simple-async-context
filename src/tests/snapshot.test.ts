import { AsyncContext } from '..';
import { AsyncSnapshot } from '../lib/AsyncSnapshot';
import { wait } from './_lib';


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

    const asyncContext = new AsyncContext.Variable();
    let snapshot: AsyncSnapshot = null;

    const total = asyncContext.withData('Outer').wrap(async () => {
      snapshot = AsyncContext.Snapshot.create()
    });

    expect(asyncContext.get()).toBe(undefined);

    await total();

    expect(asyncContext.get()).toBe(undefined);

    snapshot.run(() => {
      expect(asyncContext.get()).toBe('Outer');
    });

    expect(asyncContext.get()).toBe(undefined);
  })

  it('snapshot (scenario 2): should know in which context it is', async () => {

    const asyncContext = new AsyncContext.Variable();
    let snapshot: AsyncSnapshot = null;

    const total = asyncContext.withData('Outer').wrap(async () => {
      await wait(100)
      snapshot = AsyncContext.Snapshot.create()
    });

    expect(asyncContext.get()).toBe(undefined);

    await total();

    expect(asyncContext.get()).toBe(undefined);

    snapshot.run(async () => {
      await wait(100)
      expect(asyncContext.get()).toBe('Outer');
    });

    expect(asyncContext.get()).toBe(undefined);
  })

  it('snapshot (scenario 3): should know in which context it is', async () => {
    let snapshot: AsyncSnapshot = null;
    const asyncContext = new AsyncContext.Variable('1');
    const asyncContext2 = new AsyncContext.Variable('2');

    const innerCallback = asyncContext.withData('Inner').wrap(async () => {
      return asyncContext2.run('Inner 2', async () => {
        await wait(100);
        snapshot = AsyncContext.Snapshot.create()
      })
    });

    const total = asyncContext.withData('Outer').wrap(async () => {
      await innerCallback();
    });

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

    await total();

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

    snapshot.run(() => {
      expect(asyncContext.get()).toBe('Inner');
      expect(asyncContext2.get()).toBe('Inner 2');
    });

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

  })

  it('snapshot (scenario 4): should know in which context it is', async () => {
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

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

    snapshot.run(async () => {
      expect(asyncContext.get()).toBe('Inner');
      expect(asyncContext2.get()).toBe('Inner 2');
      await wait(100);


      asyncContext.withData('Outer:WithinSnapshot').run(async () => {
        await wait(100);
        expect(asyncContext.get()).toBe('Outer:WithinSnapshot');
        expect(asyncContext2.get()).toBe('Inner 2');
      })

    });

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

    await wait(1000)

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

