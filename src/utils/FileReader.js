const Validator = require('./Validator');
const inStream = require('in-stream');
const fs = require('fs');

class ReadFile {

  static getObjectFromString(data) {
    return new Promise((resolve, reject) => {
      if (Validator.isJsonObject(data)) {
        const object = JSON.parse(data);
        resolve(object);
      } else {
        reject('Object must be described by a valid JSON');
      }
    });
  }

  static readObjectFromFile(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
        if (err) {
          reject(err);
        } else {
          this.getObjectFromString(data).then(obj => {
            resolve(obj);
          }).catch(err => {
            reject(err);
          });
        }
      });
    });
  }

  static readObjectFromStdin() {
    return new Promise((resolve, reject) => {
      let streamContent = '';
      inStream.on('data', chunk => {
        streamContent += chunk.toString('utf8');
      });

      inStream.on('close', () => {
        this.getObjectFromString(streamContent).then(obj => {
          resolve(obj);
        }).catch(err => {
          reject(err);
        });
      });

      inStream.on('error', error => {
        reject(error);
      });
    });
  }

  static getObject(program) {
    if (program.file) {
      return this.readObjectFromFile(program.file);
    } else {
      return this.readObjectFromStdin();
    }
  }
}

module.exports = ReadFile;