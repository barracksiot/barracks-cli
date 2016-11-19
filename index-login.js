const read = require('read');
const program = require('commander');
const config = require('./config');
const Barracks = require('./clients/Barracks');
const barracks = new Barracks(config.barracks);
const UserConfiguration = require('./repositories/UserConfiguration');
const userConfiguration = new UserConfiguration(config.userConfig);

program.parse(process.argv);


read({ prompt: 'E-mail: ' }, (err, email) => {
  read({ prompt: 'Password: ', silent: true }, (err, password) => {
    barracks.authenticate(email, password).then((token) => {
      return userConfiguration.saveAuthenticationToken(token);
    }).then(() => {
      console.log('Authentication successful');
    }).catch(err => {
      console.log('Authentication failed:');
      console.log(err);
    });
  });
});
