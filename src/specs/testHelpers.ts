import { snoop } from 'snoop';

export { silentLogs, noop, errorMessage };

const noop = () => {};

const silentLogs = ({
  partials,
  mock,
}: Partial<{ partials: Array<string>; mock: boolean }> = {}) => {
  const store: Record<string, (...args: any) => unknown> = {};
  const logs = partials || ['log', 'warn', 'error', 'info'];
  const mocks: Record<string, ReturnType<typeof snoop>> = {};

  for (const key of logs) {
    store[key] = console[key as keyof Console];

    // opt-out mocking
    if (mock !== false) {
      mocks[key] = snoop(noop);
      console[key as keyof Console] = mocks[key].fn;
    } else console[key as keyof Console] = noop;
  }

  return {
    mocks,
    partialReset: (resetPartials: Array<string>) => {
      for (const key of resetPartials) {
        console[key as keyof Console] = store[key];
      }

      return () => {
        for (const key of resetPartials) {
          console[key as keyof Console] = noop;
        }
      };
    },
    reset: () => {
      for (const key of logs) {
        console[key as keyof Console] = store[key];
      }
    },
  };
};

const errorMessage = (fn: () => unknown) => {
  try {
    fn();
  } catch ({ message }) {
    return message;
  }

  throw Error('no error thrown!');
};
