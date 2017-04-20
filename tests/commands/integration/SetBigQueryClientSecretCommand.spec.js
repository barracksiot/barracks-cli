const mockStdin = require('mock-stdin');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();
const Stream = require('stream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('PublishDeploymentPlanCommand', () => {

  let publishDeploymentPlanCommand;
  let proxyIsJsonObject;
  let proxyFileExists;
  let proxyInStream = new Stream();
  let proxyReadFile;
  let spyOnError;
  let spyOnData;
  let spyOnClose;
  const token = '345678ujhbvcdsw34rg';
  const file = 'path/to/file.json';
  const validProgram = { file };

  function getProxyCommand() {
    return proxyquire('../../../src/commands/package/PublishDeploymentPlanCommand', {
      '../../utils/Validator': {
        isJsonObject: (str) => {
          return proxyIsJsonObject(str);
        },
        fileExists: (path) => {
          return proxyFileExists(path);
        }
      },
      'in-stream': proxyInStream,
      fs: {
        readFile: (file, callback) => {
          return proxyReadFile(file, callback);
        }
      }
    });
  }