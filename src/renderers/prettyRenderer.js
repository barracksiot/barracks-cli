const prettyjson = require('prettyjson');

function write(content) {
  console.log(prettyjson.render(content));
}

module.exports = promise => new Promise((resolve, reject) => {
  promise.then(result => {
    if (result && result.constructor.name === 'PageableStream') {
      result.onPageReceived(page => {
        write(page);
      });
    } else {
      write(result);
    }
    resolve();
  }).catch(err => {
    console.error(err);
    reject();
  });
});