const BarracksCommand = require('../BarracksCommand');

class SendMessageCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--target [value]', 'The target(s) to which the message will be sent')
      .option('--message [value]', 'The content of the message');
  }

  validateCommand(program) {
    return !!(
      program.target && program.target !== true &&
      program.message && program.message !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.sendMessage(token, {
        target: program.target,
        message: program.message
      });
    });
  }
}

module.exports = SendMessageCommand;