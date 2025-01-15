export const main = async () => {

};

Promise.resolve()
  .then(() => console.log("START"))
  .then(() => main())
  .then(() => console.log("DONE"))
  .catch((err) => console.log(err, "ERROR"));
