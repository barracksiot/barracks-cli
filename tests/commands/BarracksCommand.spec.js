const barracksCommandPath = '../../src/commands/BarracksCommand';
const mockStdin = require('mock-stdin');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const BarracksCommand = require(barracksCommandPath);
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('BarracksCommand', () => {

  let barracksCommand;
  let stdin;
  let mockedRead;

  const account = {
    firstName: 'John',
    lastName: 'Doe',
    company: 'Plop and Cie',
    phone: '1234567890',
    id: '57c068',
    email: 'john@doe.com',
    apiKey: 'da9d4d6a47547c8ed313fee8',
    status: 'active' 
  };
  const accountPassword = 'guest';
  const token = 's5d6f.657fgyi.d6tfuyg';

  function resetCommand() {
    barracksCommand = new BarracksCommand();
    barracksCommand.barracks = {};
    barracksCommand.userConfiguration = {};
  }

  describe('#validateCommand()', () => {

    before(() => {
      resetCommand();
    });

    it('should return true by default', () => {
      const result = barracksCommand.validateCommand();
      expect(result).to.be.true;
    });
  });

  describe('#getAuthenticationToken()', () => {

    before(() => {
      resetCommand();
    });

    it('should return a token when userConfiguration already contains a token', done => {
      // Given
      barracksCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account))
      };
      barracksCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };

      // When / Then
      barracksCommand.getAuthenticationToken().then(result => {
        expect(result).to.be.equals(token);
        expect(barracksCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(barracksCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledWithExactly();
        done();
      }).catch(err => {
        done('should have succeeded');
      });
    });

    it('should ask credentials to user if userConfiguration has no token, and return a token if credentials are valid', done => {
      // Given
      barracksCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.reject('error'))
      };
      barracksCommand.requestUserAuthentication = sinon.stub().returns(Promise.resolve({ email: account.email, password: accountPassword }));
      barracksCommand.authenticate = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      barracksCommand.getAuthenticationToken().then(result => {
        expect(result).to.be.equals(token);
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(barracksCommand.requestUserAuthentication).to.have.been.calledOnce;
        expect(barracksCommand.requestUserAuthentication).to.have.been.calledWithExactly();
        expect(barracksCommand.authenticate).to.have.been.calledOnce;
        expect(barracksCommand.authenticate).to.have.been.calledWithExactly(account.email, accountPassword);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should ask credentials to user if userConfiguration has no token, and return an error if credentials are invalid', done => {
      // Given
      const errorMessage = 'Nope !';
      barracksCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.reject('error'))
      };
      barracksCommand.requestUserAuthentication = sinon.stub().returns(Promise.reject(errorMessage));

      // When / Then
      barracksCommand.getAuthenticationToken().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorMessage);
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(barracksCommand.requestUserAuthentication).to.have.been.calledOnce;
        expect(barracksCommand.requestUserAuthentication).to.have.been.calledWithExactly();
        done();
      });
    });
  });

  describe('#requestUserAuthentication()', () => {

    before(() => {
      resetCommand();
      stdin = mockStdin.stdin();
    });

    after(() => {
      resetCommand();
      stdin.end();
    });

    it('should read login and password from console input', done => {

      setTimeout(() => {
        stdin.send(`${account.email}\r`);
        setTimeout(() => {
          stdin.send(`${accountPassword}\r`);
        }, 100);
      }, 100);

      // When / Then
      barracksCommand.requestUserAuthentication().then(result => {
        expect(result).to.not.be.null;
        expect(result).to.not.be.undefined;
        expect(result).to.have.ownProperty('email');
        expect(result.email).to.be.equals(account.email);
        expect(result).to.have.ownProperty('password');
        expect(result.password).to.be.equals(accountPassword);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject error if email read fail', done => {
      // Given
      const error = 'error';
      const checkMockedRead = sinon.spy();
      const MockedBarracksCommand = proxyquire(barracksCommandPath, {
        'read': (options, callback) => {
          return mockedRead(options, callback);
        }
      });
      mockedBarracksCommand = new MockedBarracksCommand();
      mockedRead = (options, callback) => {
        checkMockedRead(options, callback);
        callback(error);
      };

      // When / Then
      mockedBarracksCommand.requestUserAuthentication().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(checkMockedRead).to.have.been.calledOnce;
        expect(checkMockedRead).to.have.been.calledWithExactly(
          { prompt: 'Account e-mail: ' },
          sinon.match.func
        );
        done();
      });
    });

    it('should reject error if password read fail', done => {
      // Given
      let mockCallCount = 0;
      const error = 'error';
      const checkFirstMockedRead = sinon.spy();
      const checkSecondMockedRead = sinon.spy();
      const MockedBarracksCommand = proxyquire(barracksCommandPath, {
        'read': (options, callback) => {
          return mockedRead(options, callback);
        }
      });
      mockedBarracksCommand = new MockedBarracksCommand();
      mockedRead = (options, callback) => {
        if (mockCallCount === 0) {
          checkFirstMockedRead(options, callback);
          callback(undefined, account.email);
        } else {
          checkSecondMockedRead(options, callback);
          callback(error);
        }
        ++mockCallCount;
      };

      // When / Then
      mockedBarracksCommand.requestUserAuthentication().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(checkFirstMockedRead).to.have.been.calledOnce;
        expect(checkFirstMockedRead).to.have.been.calledWithExactly(
          { prompt: 'Account e-mail: ' },
          sinon.match.func
        );
        expect(checkSecondMockedRead).to.have.been.calledOnce;
        expect(checkSecondMockedRead).to.have.been.calledWithExactly(
          { prompt: 'Password: ', silent: true },
          sinon.match.func
        );
        done();
      });
    });
  });

  describe('#authenticate()', () => {

    before(() => {
      resetCommand();
    });

    it('should return a token when valid credentials given', done => {
      // Given
      barracksCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token))
      };
      barracksCommand.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      barracksCommand.authenticate(account.email, accountPassword).then(result => {
        expect(result).to.equals(token);
        expect(barracksCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(barracksCommand.barracks.authenticate).to.have.been.calledWithExactly(account.email, accountPassword);
        expect(barracksCommand.saveAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.saveAuthenticationToken).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return an error token when invalid credentials given', done => {
      // Given
      const badEmail = 'plop@plop.com';
      const badPassword = 'password';
      const errorMessage = 'Invalid credentials';
      barracksCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.reject(errorMessage))
      };

      // When / Then
      barracksCommand.authenticate(badEmail, badPassword).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.equals(errorMessage);
        expect(barracksCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(barracksCommand.barracks.authenticate).to.have.been.calledWithExactly(badEmail, badPassword);
        done();
      });
    });

    it('should return an error token when saveAuthenticationToken fail', done => {
      // Given
      const errorMessage = 'A marche po';
      barracksCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token))
      };
      barracksCommand.saveAuthenticationToken = sinon.stub().returns(Promise.reject(errorMessage));

      // When / Then
      barracksCommand.authenticate(account.email, accountPassword).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.equals(errorMessage);
        expect(barracksCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(barracksCommand.barracks.authenticate).to.have.been.calledWithExactly(account.email, accountPassword);
        expect(barracksCommand.saveAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.saveAuthenticationToken).to.have.been.calledWithExactly(token);
        done();
      });
    });
  });

  describe('#saveAuthenticationToken()', () => {

    before(() => {
      resetCommand();
    });

    it('should call save token of userConfiguration', done => {
      // Given
      const response = 'coucou';
      barracksCommand.userConfiguration.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracksCommand.saveAuthenticationToken(token).then(result => {
        expect(result).to.equals(response);
        expect(barracksCommand.userConfiguration.saveAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.userConfiguration.saveAuthenticationToken).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#cleanupProgramOptions()', () => {

    let mockedBarracksCommand;

    const minimumProgram = {
      option: () => { return program; },
      parse: () => { return program; }
    };
    let program = minimumProgram;
    const MockedBarracksCommand = proxyquire(barracksCommandPath, {
      commander: program
    });

    beforeEach(() => {
      mockedBarracksCommand = new MockedBarracksCommand();
    });

    it('should not alter the program if one option empty', () => {
      // Given
      const optionLabel = 'anOption';
      const program = Object.assign({}, minimumProgram, {
        options: [{
          long: `--${optionLabel}`
        }]
      });
      const programBefore = Object.assign({}, program);

      // When
      mockedBarracksCommand.cleanupProgramOptions(program);
      
      // Then
      expect(program).to.deep.equals(programBefore);
    });

    it('should not alter the program if one option given as string', () => {
      // Given
      const optionLabel = 'anOption';
      const program = Object.assign({}, minimumProgram, {
        [optionLabel]: 'anOptionValue',
        options: [{
          long: `--${optionLabel}`
        }]
      });
      const programBefore = Object.assign({}, program);

      // When
      mockedBarracksCommand.cleanupProgramOptions(program);
      
      // Then
      expect(program).to.deep.equals(programBefore);
    });

    it('should not alter the program if one option given as boolean', () => {
      // Given
      const optionLabel = 'anOption';
      const program = Object.assign({}, minimumProgram, {
        [optionLabel]: true,
        options: [{
          long: `--${optionLabel}`
        }]
      });
      const programBefore = Object.assign({}, program);

      // When
      mockedBarracksCommand.cleanupProgramOptions(program);
      
      // Then
      expect(program).to.deep.equals(programBefore);
    });

    it('should replace option that is a function if a function is given', () => {
      // Given
      const optionLabel = 'anOption';
      const program = Object.assign({}, minimumProgram, {
        [optionLabel]: () => {},
        options: [{
          long: `--${optionLabel}`
        }]
      });
      const programExpected = Object.assign({}, program, {
        [optionLabel]: undefined,
      });

      // When
      mockedBarracksCommand.cleanupProgramOptions(program);
      
      // Then
      expect(program).to.deep.equals(programExpected);
    });

    it('should replace only options given as function when many options given', () => {
      // Given
      const emptyOptionLabel = 'emptyOption';
      const stringOptionLabel = 'stringOption';
      const booleanOptionLabel = 'booleanOption';
      const functionOptionLabel = 'functionOption';
      const program = Object.assign({}, minimumProgram, {
        [stringOptionLabel]: 'aStringValue',
        [booleanOptionLabel]: true,
        [functionOptionLabel]: () => {},
        options: [
          { long: `--${emptyOptionLabel}` },
          { long: `--${stringOptionLabel}` },
          { long: `--${booleanOptionLabel}` },
          { long: `--${functionOptionLabel}` }
        ]
      });
      const programExpected = Object.assign({}, program, {
        [functionOptionLabel]: undefined,
      });

      // When
      mockedBarracksCommand.cleanupProgramOptions(program);
      
      // Then
      expect(program).to.deep.equals(programExpected);
    });
  });
  
  describe('#validateOptionnalParams()', () => {

    let mockedBarracksCommand;

    const minimumProgram = {
      option: () => { return program; },
      parse: () => { return program; }
    };
    let program = minimumProgram;
    const MockedBarracksCommand = proxyquire(barracksCommandPath, {
      commander: program
    });

    beforeEach(() => {
      mockedBarracksCommand = new MockedBarracksCommand();
    });

    it('should return true when one optionnal argument and valid value given', () => {
      // Given
      const option1 = 'option1';
      program = Object.assign({}, minimumProgram, { option1 });

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, [ 'option1' ]);
      
      // Then
      expect(result).to.be.true;
      expect(program.option1).to.be.equals(option1);
    });

    it('should return true when one optionnal argument and none given', () => {
      //Given
      program = Object.assign({}, minimumProgram);
      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, [ 'option1' ]);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when one optionnal argument and no value given', () => {
      //Given
      program = Object.assign({}, minimumProgram, { option1: true });
      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, [ 'option1' ]);
      // Then
      expect(result).to.be.false;
      expect(program.option1).to.be.equals(true);
    });

    it('should return true when two optionnal arguments and valid value given', () => {
      // Given
      const option1 = 'option1';
      const option2 = 'option2';
      program = Object.assign({}, minimumProgram, { option1, option2 });

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, [ 'option1', 'option2' ]);
      
      // Then
      expect(result).to.be.true;
      expect(program.option1).to.be.equals(option1);
      expect(program.option2).to.be.equals(option2);
    });

    it('should return true when two optionnal arguments and both missing', () => {
      // Given
      program = Object.assign({}, minimumProgram);
      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, [ 'option1', 'option2' ]);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when two optionnal arguments and one missing and second valid', () => {
      // Given
      const option1 = 'option1';
      program = Object.assign({}, minimumProgram, { option1 });

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, [ 'option1', 'option2' ]);
      
      // Then
      expect(result).to.be.true;
      expect(program.option1).to.be.equals(option1);
    });

    it('should return false when two optionnal arguments and one missing and second empty', () => {
      // Given
      const option1 = 'option1';
      program = Object.assign({}, minimumProgram, { option1, option2: true });

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, [ 'option1', 'option2' ]);
      
      // Then
      expect(result).to.be.false;
      expect(program.option1).to.be.equals(option1);
      expect(program.option2).to.be.equals(true);
    });

    it('should return false when two optionnal arguments and both empty', () => {
      // Given
      const option1 = 'option1';
      program = Object.assign({}, minimumProgram, { option1: true, option2: true });

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, [ 'option1', 'option2' ]);
      
      // Then
      expect(result).to.be.false;
      expect(program.option1).to.be.equals(true);
      expect(program.option2).to.be.equals(true);
    });

    it('should return true when many optionnal arguments and all given valid', () => {
      // Given
      const optionnalFields = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
      const option1 = 'qwerty';
      const option2 = 'kjhgfd';
      const option3 = 'ertytfghtred';
      const option4 = '23445t';
      const option5 = 'yudtyfthdgf';
      program = Object.assign({}, minimumProgram, {
        option1,
        option2,
        option3,
        option4,
        option5
      });

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, optionnalFields);
      
      // Then
      expect(result).to.be.true;
      expect(program.option1).to.be.equals(option1);
      expect(program.option2).to.be.equals(option2);
      expect(program.option3).to.be.equals(option3);
      expect(program.option4).to.be.equals(option4);
      expect(program.option5).to.be.equals(option5);
    });

    it('should return true when many optionnal arguments and all missing', () => {
      // Given
      const optionnalFields = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
      program = Object.assign({}, minimumProgram);

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, optionnalFields);
      
      // Then
      expect(result).to.be.true;
    });

    it('should return true when many optionnal arguments and some missing', () => {
      // Given
      const optionnalFields = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
      const option1 = 'qwerty';
      const option3 = 'ertytfghtred';
      const option5 = 'yudtyfthdgf';
      program = Object.assign({}, minimumProgram, {
        option1,
        option3,
        option5
      });

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, optionnalFields);
      
      // Then
      expect(result).to.be.true;
      expect(program.option1).to.be.equals(option1);
      expect(program.option3).to.be.equals(option3);
      expect(program.option5).to.be.equals(option5);
    });

    it('should return false when many optionnal arguments and one is empty', () => {
      // Given
      const optionnalFields = [ 'option1', 'option2', 'option3', 'option4', 'option5' ];
      const option1 = 'qwerty';
      const option2 = true;
      const option3 = 'ertytfghtred';
      const option4 = '23445t';
      const option5 = 'yudtyfthdgf';
      program = Object.assign({}, minimumProgram, {
        option1,
        option2,
        option3,
        option4,
        option5
      });

      // When
      const result = mockedBarracksCommand.validateOptionnalParams(program, optionnalFields);
      
      // Then
      expect(result).to.be.false;
      expect(program.option1).to.be.equals(option1);
      expect(program.option2).to.be.equals(option2);
      expect(program.option3).to.be.equals(option3);
      expect(program.option4).to.be.equals(option4);
      expect(program.option5).to.be.equals(option5);
    });
  });

  describe('#execute()', () => {

    before(() => {
      resetCommand();
    });

    it('should reject to make sure it is overridden', done => {
      // When / Then
      barracksCommand.execute().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.equals('Need to be overridden');
        done();
      });
    });
  });

  describe('#error(program)', () => {

    it('should print error and display help', () => {
      // Given
      const originalConsoleError = console.error;
      const program = {
        help: sinon.spy()
      };
      console.error = sinon.spy();

      // When
      barracksCommand.error(program);

      // Then
      expect(program.help).to.have.been.calledOnce;
      expect(console.error).to.have.been.calledOnce;
      expect(console.error).to.have.been.calledWithExactly(
        'Mandatory arguments are missing or invalid.'
      );
      console.error = originalConsoleError;
    });

  });

  describe('#render()', () => {

    let mockedBarracksCommand;
    let spyRender;
    let spyJsonRender;

    const mockedRender = (data) => {
      spyRender(data);
    };
    const mockedJsonRender = (data) => {
      spyJsonRender(data);
    };
    const program = {
      option: () => { return program; },
      parse: () => { return program; },
      help: () => {}
    };
    const MockedBarracksCommand = proxyquire(barracksCommandPath, {
      '../renderers/prettyRenderer': (data) => {
        mockedRender(data);
      },
      '../renderers/jsonRenderer': (data) => {
        mockedJsonRender(data);
      },
      commander: program
    });

    beforeEach(() => {
      mockedBarracksCommand = new MockedBarracksCommand();
    });

    it('should call error if arguments are missing', () => {
      // Given
      mockedBarracksCommand.cleanupProgramOptions = sinon.spy();
      mockedBarracksCommand.validateCommand = sinon.stub().returns(false);
      mockedBarracksCommand.error = sinon.spy();

      // When
      mockedBarracksCommand.render();

      // Then
      expect(mockedBarracksCommand.cleanupProgramOptions).to.have.been.calledOnce;
      expect(mockedBarracksCommand.cleanupProgramOptions).to.have.been.calledWithExactly(program);
      expect(mockedBarracksCommand.validateCommand).to.have.been.calledOnce;
      expect(mockedBarracksCommand.validateCommand).to.have.been.calledWithExactly(program);
      expect(mockedBarracksCommand.error).to.have.been.calledOnce;
      expect(mockedBarracksCommand.error).to.have.been.calledWithExactly(program);
    });

    it('should call renderer if execution successful', () => {
      // Given
      const executeResponse = { the: 'response' };
      spyRender = sinon.spy();
      mockedBarracksCommand.cleanupProgramOptions = sinon.spy();
      mockedBarracksCommand.validateCommand = sinon.stub().returns(true);
      mockedBarracksCommand.execute = sinon.stub().returns(executeResponse);

      // When
      mockedBarracksCommand.render();

      // Then
      expect(mockedBarracksCommand.cleanupProgramOptions).to.have.been.calledOnce;
      expect(mockedBarracksCommand.cleanupProgramOptions).to.have.been.calledWithExactly(program);
      expect(mockedBarracksCommand.validateCommand).to.have.been.calledOnce;
      expect(mockedBarracksCommand.validateCommand).to.have.been.calledWithExactly(program);
      expect(mockedBarracksCommand.execute).to.have.been.calledOnce;
      expect(mockedBarracksCommand.execute).to.have.been.calledWithExactly(program);
      expect(spyRender).to.have.been.calledOnce;
      expect(spyRender).to.have.been.calledWithExactly(executeResponse);
    });

    it('should call json renderer if execution successful and json flag', () => {
      // Given
      const executeResponse = { the: 'response' };
      program.json = true;
      spyJsonRender = sinon.spy();
      mockedBarracksCommand.cleanupProgramOptions = sinon.spy();
      mockedBarracksCommand.validateCommand = sinon.stub().returns(true);
      mockedBarracksCommand.execute = sinon.stub().returns(executeResponse);

      // When
      mockedBarracksCommand.render();

      // Then
      expect(mockedBarracksCommand.cleanupProgramOptions).to.have.been.calledOnce;
      expect(mockedBarracksCommand.cleanupProgramOptions).to.have.been.calledWithExactly(program);
      expect(mockedBarracksCommand.validateCommand).to.have.been.calledOnce;
      expect(mockedBarracksCommand.validateCommand).to.have.been.calledWithExactly(program);
      expect(mockedBarracksCommand.execute).to.have.been.calledOnce;
      expect(mockedBarracksCommand.execute).to.have.been.calledWithExactly(program);
      expect(spyJsonRender).to.have.been.calledOnce;
      expect(spyJsonRender).to.have.been.calledWithExactly(executeResponse);
    });
  });
});