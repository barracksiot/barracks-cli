function write(content) {
  console.log(content);
}

module.exports = promise => new Promise(resolve => {
  promise.then(result => {
    if (result.constructor.name === 'PageableStream') {
      let firstPage = true;
      write('[');
      result.onPageReceived(page => {
        if (!firstPage) {
          write(',');
        }
        write(JSON.stringify(page).slice(1, -1));
        firstPage = false;
      });
      result.onLastPage(() => {
        write(']');
      });
    } else {
      write(JSON.stringify(result));
    }
    resolve();
  }).catch(err => {
    console.error(err);
    resolve();
  });
});