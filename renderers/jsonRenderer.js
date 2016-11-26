function write(content) {
  console.log(content);
}

module.exports = promise => {
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
      write(result);
    }
  }).catch(err => {
    console.log(err);
  });
};