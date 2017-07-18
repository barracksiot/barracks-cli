const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreateHookCommand', () => {

  let createHookCommand;
  let proxyIsJsonObject;
  let proxyFileExists;

  const CreateHookCommand = proxyquire('../../../src/commands/hook/CreateHookCommand', {
    '../../utils/Validator': {
      isJsonObject: (str) => {
        return proxyIsJsonObject(str);
      },
      fileExists: (path) => {
        return proxyFileExists(path);
      }
    }
  });

  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {
    web: true,
    name: 'HookName',
    url: 'https://not.barracks.io'
  };
  const createdHook = {
    type: 'web',
    name: 'HookName',
    url: 'https://not.barracks.io',
    userId: '12345'
  };

  before(() => {
    createHookCommand = new CreateHookCommand();
    createHookCommand.barracks = {};
    createHookCommand.userConfiguration = {};
    proxyIsJsonObject = undefined;
    roxyFileExists = undefined;
  });

  describe('#validateCommand(program)', () => {

    it('should return true when all the options are valid and present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = createHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when type is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web: false });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when name is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { name: undefined });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when url is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { url: undefined });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

  });

  describe('#execute(program)', () => {

    it('should return the created hook when the request was successful', done => {
      // Given
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.resolve(createdHook))
      };

      // When / Then
      createHookCommand.execute(programWithValidOptions).then(result => {
        expect(result).to.be.equals(createdHook);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
          type: 'web',
          name: programWithValidOptions.name,
          url: programWithValidOptions.url
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return error when the request failed', done => {
      // Given
      const error = 'Marche pas!!!';
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.reject(error))
      };

      // When / Then
      createHookCommand.execute(programWithValidOptions).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
            type: 'web',
            name: programWithValidOptions.name,
            url: programWithValidOptions.url
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

  });
});
