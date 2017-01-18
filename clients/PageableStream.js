const EventEmitter = require('events').EventEmitter;

const _eventEmitter = new WeakMap();

const PAGE_RECEIVED_EVENT = 'page';
const LAST_PAGE_EVENT = 'end';
const ERROR_EVENT = 'error';

function getEventEmitter(object) {
  return _eventEmitter.get(object);
}

function createEventEmitter(object) {
  _eventEmitter.set(object, new EventEmitter());
}

class PageableStream {

  constructor() {
    createEventEmitter(this);
  }

  onPageReceived(cb) {
    getEventEmitter(this).on(PAGE_RECEIVED_EVENT, cb);
  }

  onError(cb) {
    getEventEmitter(this).on(ERROR_EVENT, cb);
  }

  onLastPage(cb) {
    getEventEmitter(this).on(LAST_PAGE_EVENT, cb);
  }

  write(page) {
    getEventEmitter(this).emit(PAGE_RECEIVED_EVENT, page);
  }

  fail(error) {
    getEventEmitter(this).emit(ERROR_EVENT, error);
  }

  lastPage() {
    getEventEmitter(this).emit(LAST_PAGE_EVENT);
  }

}

module.exports = PageableStream;