"strict mode";

const debug = require('../config').debug;
const winston = require('winston');
winston.emitErrs = true;

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: debug ? 'debug' : 'info',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

logger.stream = {
  write: (message) => {
    logger.info(message);
  }
};

logger.debug("The application is in debug mode");

module.exports = logger;