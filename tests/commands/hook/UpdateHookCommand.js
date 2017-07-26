const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const UpdateHookCommand = require('../../../src/commands/hook/UpdateHookCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('UpdateHookCommand', () => {

  let updateHookCommand;

  const token = 'i8uhkj.token.65ryft';
  const name = 'MyHook';
  const newName = 'MyNewHook';
  const url = 'https://new.url/callDaHook';
  const programWithNameOptions = { name };
  const programWithValidOptions = {
    name,
    newName,
    url
  };

  before(() => {
    updateHookCommand = new UpdateHookCommand();
    updateHookCommand.barracks = {};
    updateHookCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when name and newName given', () => {
      // Given
      const program = Object.assign({}, programWithNameOptions, { newName });

      // When
      const result = updateHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return true when name and url given', () => {
      // Given
      const program = Object.assign({}, programWithNameOptions, { url });

      // When
      const result = updateHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return true when all options given', () => {
      // Given
      const program = Object.assign({}, programWithNameOptions, { newName, url });

      // When
      const result = updateHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when no optionnal option given', () => {
      // Given
      const program = Object.assign({}, programWithNameOptions);

      // When
      const result = updateHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when no name given', () => {
      // Given
      const program = {};

      // When
      const result = updateHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when name given as flag', () => {
      // Given
      const program = { name: true};

      // When
      const result = updateHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when newName given as flag', () => {
      // Given
      const program = Object.assign({}, programWithNameOptions, {
        newName: true
      });

      // When
      const result = updateHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when url given as flag', () => {
      // Given
      const program = Object.assign({}, programWithNameOptions, {
        url: true
      });

      // When
      const result = updateHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });
  });

  describe('#configureCommand(program)', () => {

    it('should display 3 options', () => {
      // Given
      const options = [];
      const program = {
        option: (key, description) => {
          options.push({ [key]: description });
          return program;
        }
      };

      // When
      const result = updateHookCommand.configureCommand(program);

      // Then
      expect(result).to.be.equal(program);
      expect(options).to.have.length(3);
      expect(options[0]).to.have.property('--name [hookName]');
      expect(options[1]).to.have.property('--newName [newHookName]');
      expect(options[2]).to.have.property('--url [newUrl]');
    });
  });

  describe('#execute(program)', () => {
    
    const oldUrl = 'https://old.url/callDaHook';
    const hook = {
      name: name,
      url: oldUrl
    };

    const newHook = {
      name: newName,
      url: url
    };

    it('should reject an error when authentication fail', done => {
      // Given
      const error = 'Error';
      updateHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      updateHookCommand.execute(programWithValidOptions).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        done();
      });
    });

    it('should reject an error when getHook request fail', done => {
      // Given
      const error = 'Error';
      updateHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateHookCommand.barracks.getHook = sinon.stub().returns(Promise.reject(error));

      // When / Then
      updateHookCommand.execute(programWithValidOptions).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(updateHookCommand.barracks.getHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.getHook).to.have.been.calledWithExactly(
          token,
          name
        );
        done();
      });
    });

    it('should reject an error when updateHook request fail', done => {
      // Given
      const error = 'Error';
      updateHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateHookCommand.barracks.getHook = sinon.stub().returns(Promise.resolve(hook));
      updateHookCommand.barracks.updateHook = sinon.stub().returns(Promise.reject(error));

      // When / Then
      updateHookCommand.execute(programWithValidOptions).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(updateHookCommand.barracks.getHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.getHook).to.have.been.calledWithExactly(
          token,
          name
        );
        expect(updateHookCommand.barracks.updateHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.updateHook).to.have.been.calledWithExactly(
          token,
          name,
          newHook
        );
        done();
      });
    });

    it('should resolve the new hook when updateHook request succeed and only name was changed', done => {
      // Given
      const partialNewHook = {
        name: newName,
        url: oldUrl
      };
      const program = Object.assign({}, programWithNameOptions, { newName });
      updateHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateHookCommand.barracks.getHook = sinon.stub().returns(Promise.resolve(hook));
      updateHookCommand.barracks.updateHook = sinon.stub().returns(Promise.resolve(partialNewHook));

      // When / Then
      updateHookCommand.execute(program).then(result => {
        expect(result).to.be.equals(partialNewHook);
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(updateHookCommand.barracks.getHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.getHook).to.have.been.calledWithExactly(
          token,
          name
        );
        expect(updateHookCommand.barracks.updateHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.updateHook).to.have.been.calledWithExactly(
          token,
          name,
          partialNewHook
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should resolve the new hook when updateHook request succeed and only url was changed', done => {
      // Given
      const partialNewHook = { name, url };
      const program = Object.assign({}, programWithNameOptions, { url });
      updateHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateHookCommand.barracks.getHook = sinon.stub().returns(Promise.resolve(hook));
      updateHookCommand.barracks.updateHook = sinon.stub().returns(Promise.resolve(partialNewHook));

      // When / Then
      updateHookCommand.execute(program).then(result => {
        expect(result).to.be.equals(partialNewHook);
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(updateHookCommand.barracks.getHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.getHook).to.have.been.calledWithExactly(
          token,
          name
        );
        expect(updateHookCommand.barracks.updateHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.updateHook).to.have.been.calledWithExactly(
          token,
          name,
          partialNewHook
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should resolve the new hook when updateHook request succeed and name and url were changed', done => {
      // Given
      const program = Object.assign({}, programWithNameOptions, { url, newName });
      updateHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateHookCommand.barracks.getHook = sinon.stub().returns(Promise.resolve(hook));
      updateHookCommand.barracks.updateHook = sinon.stub().returns(Promise.resolve(newHook));

      // When / Then
      updateHookCommand.execute(program).then(result => {
        expect(result).to.be.equals(newHook);
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(updateHookCommand.barracks.getHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.getHook).to.have.been.calledWithExactly(
          token,
          name
        );
        expect(updateHookCommand.barracks.updateHook).to.have.been.calledOnce;
        expect(updateHookCommand.barracks.updateHook).to.have.been.calledWithExactly(
          token,
          name,
          newHook
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
