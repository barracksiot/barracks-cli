// const mockStdin = require('mock-stdin');
// const chai = require('chai');
// const spies = require('chai-spies');
// const expect = chai.expect;
// const chaiAsPromised = require("chai-as-promised");
// const CreateUpdateCommand = require('./CreateUpdateCommand');

// chai.use(chaiAsPromised);
// chai.use(spies);


// describe('CreateUpdateCommand', () => {


//   let createUpdateCommand;

//   describe('#execute()', () => {

//     before(() => {
//       stdin = mockStdin.stdin();
//       createUpdateCommand = new CreateUpdateCommand();
//       createUpdateCommand.barracks = {};
//       createUpdateCommand.userConfiguration = {};
//     });

//     after(() => {
//       stdin.end();
//     });
  
//     it('should return the new update when the request was successful', () => {
//       // Given
//       createUpdateCommand.userConfiguration = {
//         getAuthenticationToken: () => Promise.resolve(token)
//       };
//       chai.spy.on(createUpdateCommand.userConfiguration, 'getAuthenticationToken');
//       createUpdateCommand.barracks = {
//         getAccount: token => Promise.resolve(account),
//         getChannelByName: token => Promise.resolve(channels),
//         createPackage: package => Promise.resolve(),
//         createUpdate: update => Promise.resolve()
//       };
//       chai.spy.on(createUpdateCommand.barracks, 'archiveUpdate');

//       // When / Then
//       expect(1).to.be(2)
//     });

//   });



// });