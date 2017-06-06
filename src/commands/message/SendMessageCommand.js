const BarracksCommand = require('../BarracksCommand');

class SendMessageCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--unitId [value]', 'The device to which the message will be sent')
      .option('--all', 'Indicates the message must be sent to all devices')
      .option('--filter [value]', 'Allows to send messages to devices belonging to a specific filter')
      .option('--message [value]', 'The content of the message');
  }

  validateCommand(program) {
    return !!(
      ((program.unitId && program.unitId !== true && !program.all) ||
       (!program.unitId && !program.filter && program.all) ||
       (!program.unitId && !program.all && program.filter && program.filter !== true)) &&
      program.message && program.message !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      if (program.all) {
        return this.barracks.sendMessageToAll(token, {
          message: program.message
        });
      } else {
        return this.barracks.sendMessage(token, {
          unitId: program.unitId,
          filter: program.filter,
          message: program.message
        });
      }
    });
  }
}

module.exports = SendMessageCommand;