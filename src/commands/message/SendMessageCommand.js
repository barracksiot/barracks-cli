const BarracksCommand = require('../BarracksCommand');

class SendMessageCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--device [value]', 'The device(s) to which the message will be sent')
      .option('--message [value]', 'The content of the message');
  }

  validateCommand(program) {
    return !!(
      program.device && program.device !== true &&
      program.message && program.message !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.sendMessage(token, {
        device: program.device,
        message: program.message
      });
    });
  }
}

module.exports = SendMessageCommand;