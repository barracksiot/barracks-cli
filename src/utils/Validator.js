const fs = require('fs');

class Validator {

  static isJsonObject(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  static isJsonArray(str) {
    try {
      const obj = JSON.parse(str);
      return Array.isArray(obj);
    } catch (e) {
      return false;
    }
    return true;
  }

  static fileExists(path) {
    try {
      fs.accessSync(path, fs.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = Validator;