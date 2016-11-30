const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const CreateUpdateCommand = require('./CreateUpdateCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreateUpdateCommand', () => {

  let createUpdateCommand;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {
    title: 'Title',
    description: 'Description',
    versionId: 'Version id',
    properties: JSON.stringify({ coucou: 'Plop' }),
    'package': __filename,
    channel: 'Production'
  };

  before(() => {
    createUpdateCommand = new CreateUpdateCommand();
    createUpdateCommand.barracks = {};
    createUpdateCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

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
      const program = Object.assign({}, programWithValidOptions, { 'package': undefined });

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when the package is not a valid path', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { 'package': '@ws5r' });

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

  describe('#execute(program)', () => {

    const updatePackage = {
      id: "PackageID"
    };

    const channel = {
      id: "ChannelId",
      name: programWithValidOptions.channel
    };

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

    it('should return an error when the get channel request failed', (done) => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getChannelByName: sinon.stub().returns(Promise.reject('Error'))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(createUpdateCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getChannelByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getChannelByName).to.have.been.calledWithExactly(token, program.channel);
        done();
      });
    });

    it('should return an error when the create package request failed', (done) => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getChannelByName: sinon.stub().returns(Promise.resolve(channel)),
        createPackage: sinon.stub().returns(Promise.reject("Error"))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getChannelByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getChannelByName).to.have.been.calledWithExactly(token, program.channel);
        expect(createUpdateCommand.barracks.createPackage).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createPackage).to.have.been.calledWithExactly(token, {
          file: program.package,
          versionId: program.versionId
        });
        done();
      });
    });

    it('should return an error when the create update request failed', (done) => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getChannelByName: sinon.stub().returns(Promise.resolve(channel)),
        createPackage: sinon.stub().returns(Promise.resolve(updatePackage)),
        createUpdate: sinon.stub().returns(Promise.reject("Error"))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getChannelByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getChannelByName).to.have.been.calledWithExactly(token, program.channel);
        expect(createUpdateCommand.barracks.createPackage).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createPackage).to.have.been.calledWithExactly(token, {
          file: program.package,
          versionId: program.versionId
        });
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledWithExactly(token, {
          packageId: updatePackage.id,
          name: program.title,
          description: program.description,
          additionalProperties: JSON.parse(program.properties),
          channelId: channel.id
        });
        done();
      });
    });

    it('should return the created update when the create update request is successful', (done) => {
      // Given
      const update = {
        uuid: 'bc354c98-bc73-4f90-9eeb-9c1698b988bc'
      };
      const program = Object.assign({}, programWithValidOptions);
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getChannelByName: sinon.stub().returns(Promise.resolve(channel)),
        createPackage: sinon.stub().returns(Promise.resolve(updatePackage)),
        createUpdate: sinon.stub().returns(Promise.resolve(update))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getChannelByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getChannelByName).to.have.been.calledWithExactly(token, program.channel);
        expect(createUpdateCommand.barracks.createPackage).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createPackage).to.have.been.calledWithExactly(token, {
          file: program.package,
          versionId: program.versionId
        });
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledWithExactly(token, {
          packageId: updatePackage.id,
          name: program.title,
          description: program.description,
          additionalProperties: JSON.parse(program.properties),
          channelId: channel.id
        });
        done();
      }).catch(err => {
        done('Should not have failed');
      });
    });

  });

});