const chai = require('chai');
const spies = require('chai-spies');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CreateUpdateCommand = require('./CreateUpdateCommand');

chai.use(chaiAsPromised);
chai.use(spies);

describe('CreateUpdateCommand', () => {

  let createUpdateCommand;

  describe('#validateCommand(program)', () => {

    const programWithValidOptions = {
      title: 'Title',
      description: 'Description',
      versionId: 'Version id',
      properties: JSON.stringify({ coucou: 'Plop' }),
      package: __filename,
      channel: 'Production'
    };

    before(() => {
      createUpdateCommand = new CreateUpdateCommand();
      createUpdateCommand.barracks = {};
      createUpdateCommand.userConfiguration = {};
    });

    it('should return true when all the options are present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  
    it('should return false when the title is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { title: undefined });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when the description is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { description: undefined });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when the versionId is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { versionId: undefined });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when the properties are missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { properties: undefined });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when the properties are not in valid JSON format', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { properties: "{plop:plop}" });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when the package is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { package: undefined });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when the package is not a valid path', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { package: '@ws5r' });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when the channel is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { channel: undefined });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

  });

});