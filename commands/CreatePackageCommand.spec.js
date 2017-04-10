const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const CreatePackageCommand = require('./CreatePackageCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreatePackageCommand', () => {

  let createPackageCommand;
  const token = 'i8uhkj.token.65ryft';
  const packageReference = 'my.package.yo';
  const packageName = 'A cool package';
  const packageDescription = 'A very cool package';
  const validProgram = {
    reference: packageReference,
    name: packageName
  };
  const validProgramWithDescription = Object.assign({}, validProgram, { description: packageDescription });

  before(() => {
    createPackageCommand = new CreatePackageCommand();
    createPackageCommand.barracks = {};
    createPackageCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = {};
      // When
      const result = createPackageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only reference option given', () => {
      // Given
      const program = { reference: packageReference };
      // When
      const result = createPackageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only name option given', () => {
      // Given
      const program = { name: packageName };
      // When
      const result = createPackageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when empty reference option given', () => {
      // Given
      const program = Object.assign({}, validProgram, { reference: true });
      // When
      const result = createPackageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when empty name option given', () => {
      // Given
      const program = Object.assign({}, validProgram, { name: true });
      // When
      const result = createPackageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });
    
    it('should return false when empty description option given', () => {
      // Given
      const program = Object.assign({}, validProgram, { description: true });
      // When
      const result = createPackageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when both reference and name options given', () => {
      // Given
      const program = validProgram;
      // When
      const result = createPackageCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when reference, name and description options given', () => {
      // Given
      const program = validProgramWithDescription;
      // When
      const result = createPackageCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should forward to barracks client when valid reference and name given', done => {
      // Given
      const program = validProgram;
      const response = {
        id: 'anId',
        reference: packageReference,
        name: packageName
      };
      createPackageCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createPackageCommand.barracks.createComponent = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      createPackageCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(createPackageCommand.barracks.createComponent).to.have.been.calledOnce;
        expect(createPackageCommand.barracks.createComponent).to.have.been.calledWithExactly(
          token,
          {
            reference: packageReference,
            name: packageName,
            description: undefined
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should forward to barracks client when valid reference, name and description given', done => {
      // Given
      const program = validProgramWithDescription
      const response = {
        id: 'anId',
        reference: packageReference,
        name: packageName,
        description: packageDescription
      };
      createPackageCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createPackageCommand.barracks.createComponent = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      createPackageCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(createPackageCommand.barracks.createComponent).to.have.been.calledOnce;
        expect(createPackageCommand.barracks.createComponent).to.have.been.calledWithExactly(
          token,
          {
            reference: packageReference,
            name: packageName,
            description: packageDescription
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});