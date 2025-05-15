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
    console.log('THROWWW ERROR');
    throw error;
  }

  if (result instanceof Promise) {
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('result is a promise')
    // return result.then((v) => v).catch((err) => {
    // console.log('result is a promise error', err)
    // throw err;
    // });
  }

  return result;
};
