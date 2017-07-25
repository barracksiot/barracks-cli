const BarracksCommand = require('../BarracksCommand');

function buildNewHook(currentHook, program) {
  return Object.assign({}, currentHook, {
    name: program.newName || currentHook.name,
    url: program.url || currentHook.url
  });
}

class UpdateHookCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--name [value]', 'The unique name of the webhook')
      .option('--newName [value]', '(Optionnal) A new unique name for the webhook')
      .option('--url [value]', '(Optionnal) A new URL for this webhook');
  }

  validateCommand(program) {
    return !!(
      program.name && program.name !== true &&
      (
        (program.newName && program.newName !== true) ||
        (program.url && program.url !== true)
      )
    );
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return this.barracks.getHook(token, program.name);
    }).then(hook => {
      const newHook = buildNewHook(hook, program);
      return this.barracks.updateHook(token, program.name, newHook);
    });
  }
}

module.exports = UpdateHookCommand;
