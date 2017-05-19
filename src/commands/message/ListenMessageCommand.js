const BarracksCommand = require('../BarracksCommand');

class ReceiveMessageCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--host [value]', 'The address of the broker to which you want to connect')
    .option('--unitId [value]', 'The device\'s id')
    .option('--username [username]', 'The user\'s ApiKey');
  }

  validateCommand(program) {
    return !!(
      program.host && program.host !== true &&
      program.deviceId && program.deviceId !== true &&
      program.username && program.username !== true
    );
  }

  execute(program) {
      return this.barracks.listen( {
        host: program.host,
        deviceId: program.deviceId,
        username: program.username
      });
  }
}

module.exports = ReceiveMessageCommand;
