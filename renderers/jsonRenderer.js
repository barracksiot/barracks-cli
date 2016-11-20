module.exports = promise => {
  promise.then(result => {
    console.log(result);
  }).catch(err => {
    console.log(err);
  });
};