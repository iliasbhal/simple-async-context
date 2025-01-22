export const runInFork = (callback: Function) => {
  let result;
  let error;

  new Promise((resolve) => {
    try {
      result = callback();
      resolve(result);
    } catch (err) {
      error = err;
    }
  });

  if (error) {
    throw error;
  }

  return result;
};
