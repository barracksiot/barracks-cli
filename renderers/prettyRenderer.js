const prettyjson = require('prettyjson');

module.exports = promise => {
  promise.then(result => {
    console.log(prettyjson.render(result));
  }).catch(err => {
    console.log(err);
  });
};