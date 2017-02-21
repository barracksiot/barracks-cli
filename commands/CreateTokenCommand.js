const BarracksCommand = require('./BarracksCommand');

class CreateTokenCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--name [value]', 'The name of the token');
  }

  validateCommand(program) {
    return !!(program.name && program.name !== true);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createToken(token, { name: program.name });
    });
  }
}

module.exports = CreateTokenCommand;
