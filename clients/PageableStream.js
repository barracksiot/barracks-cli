const EventEmitter = require('events').EventEmitter;

const _eventEmitter = new WeakMap();

const PAGE_RECEIVED_EVENT = 'page';
const LAST_PAGE_EVENT = 'end';
const ERROR_EVENT = 'error';


class PageableStream {

  constructor() {
    _eventEmitter.set(this, new EventEmitter());
  }

  onPageReceived(cb) {
    _eventEmitter.get(this).on(PAGE_RECEIVED_EVENT, cb);
  }

  onError(cb) {
    _eventEmitter.get(this).on(ERROR_EVENT, cb);
  }

  onLastPage(cb) {
    _eventEmitter.get(this).on(LAST_PAGE_EVENT, cb);
  }

  write(page) {
    _eventEmitter.get(this).emit(PAGE_RECEIVED_EVENT, page);
  }

  fail(error) {
    _eventEmitter.get(this).emit(ERROR_EVENT, error);
  }

  lastPage() {
    _eventEmitter.get(this).emit(LAST_PAGE_EVENT);
  }

}

module.exports = PageableStream;