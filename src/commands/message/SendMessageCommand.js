const BarracksCommand = require('../BarracksCommand');

class SendMessageCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--unitId [value]', 'The device to which the message will be sent')
      .option('--message [value]', 'The content of the message');
  }

  validateCommand(program) {
    return !!(
      program.unitId && program.unitId !== true &&
      program.message && program.message !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.sendMessage(token, {
        unitId: program.unitId,
        message: program.message
      });
    });
  }
}

module.exports = SendMessageCommand;