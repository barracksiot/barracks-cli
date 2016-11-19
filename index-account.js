const prettyjson = require('prettyjson');
const program = require('commander');
const config = require('./config');
const Barracks = require('./clients/Barracks');
const barracks = new Barracks(config.barracks);
const UserConfiguration = require('./repositories/UserConfiguration');
const userConfiguration = new UserConfiguration(config.userConfig);

program.parse(process.argv);

userConfiguration.getAuthenticationToken().then(token => {
  return barracks.getAccount(token);
}).then(account => {
  console.log(prettyjson.render(account, { noColor: true }));
}).catch(err => {
  console.log(err);
});
