export const runInFork = (callback: Function) => {
  let result

  new Promise((resolve) => {
    result = callback();
    resolve(result);
  })

  return result;
}