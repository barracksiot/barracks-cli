const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const ScheduleCommand = require('./ScheduleCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('ScheduleCommand', () => {

  const publishedUpdate = { 
    uuid: 'e89c3306-df2d-4651-ac35-ad5789203b7b',
    userId: '57c068e90cf2344c1a633622',
    revisionId: 4,
    name: 'pouet',
    description: null,
    packageInfo: { 
      id: '581ca89f0cf2d5adfc157a2c',
      userId: '57c068e90cf2344c1a633622',
      fileName: 'unsecure-0.0.1-alpha.tar.gz',
      md5: 'd3e305c587acd556ec8138f4d8d85f6f',
      size: 3540,
      versionId: 'frrfrf' 
    },
    additionalProperties: {},
    creationDate: '2016-11-28T22:59:45.180Z',
    status: 'published',
    channel: { 
      id: '57c08b9a0cf21701895daa9e',
      name: 'Production',
      userId: '57c068e90cf2344c1a633622',
      userDefault: true 
    } 
  };
  const token = 's5d6f.657fgyi.d6tfuyg';
  const programWithValidOptions = { args: [ 'updateuuid' ], date: '2016-09-16', time: '12:13' };
  let scheduleCommand;

  describe('#validateCommand(program)', () => {

    before(() => {
      scheduleCommand = new ScheduleCommand();
      scheduleCommand.barracks = {};
      scheduleCommand.userConfiguration = {};
    });

    it('should return false when no args', () => {
      // Given
      const program = { };

      // When
      const result = scheduleCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when empty args', () => {
      // Given
      const program = { args: [] };

      // When
      const result = scheduleCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when update uuid is given without mandatory options', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { time: undefined, date: undefined });

      // When
      const result = scheduleCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when update uuid is given with date only', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { time: undefined });

      // When
      const result = scheduleCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when update uuid is given with time only', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { date: undefined });

      // When
      const result = scheduleCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when update uuid is given with all mandatory options', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = scheduleCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

  });

  describe('#parseScheduleDate(program)', () => {

    before(() => {
      scheduleCommand = new ScheduleCommand();
      scheduleCommand.barracks = {};
      scheduleCommand.userConfiguration = {};
    });

    it('should return the date object matching the options', () => {
      // Given
      const date = new Date('2016-11-15 12:30');
      const program = { date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, time: `${date.getHours()}:${date.getMinutes()}` };

      // When
      const result = scheduleCommand.parseScheduleDate(program);

      // Then
      expect(result).to.exist;
      expect(result.getTime()).to.be.equal(date.getTime());
    });

  });

  describe('#execute()', () => {

    before(() => {
      scheduleCommand = new ScheduleCommand();
      scheduleCommand.barracks = {};
      scheduleCommand.userConfiguration = {};
    });
  
    it('should call for schedule update when update uuid and mandatory options are given', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      const date = Date.parse(`${program.date} ${program.time}`);
      scheduleCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      scheduleCommand.barracks = {
        scheduleUpdate: sinon.stub().returns(Promise.resolve(publishedUpdate))
      };

      // When / Then
      scheduleCommand.execute(program).then(result => {
        expect(result).to.equal(publishedUpdate);
        expect(scheduleCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(scheduleCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(scheduleCommand.barracks.scheduleUpdate).to.have.been.calledOnce;
        expect(scheduleCommand.barracks.scheduleUpdate).to.have.been.calledWithExactly(token, program.args[0], date);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

});
