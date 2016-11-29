const prettyjson = require('prettyjson');

function write(content) {
  console.log(prettyjson.render(content));
}

module.exports = promise => {
  promise.then(result => {
    if (result && result.constructor.name === 'PageableStream') {
      result.onPageReceived(page => {
        write(page);
      });
    } else {
      write(result);
    }
  }).catch(err => {
    console.error(err);
  });
};