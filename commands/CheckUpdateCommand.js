const BarracksCommand = require('./BarracksCommand');

class CheckUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<emulated-device>')
      .option('--download [path]', 'If an update is available, download the package associated to the specified folder');
  }

  validateCommand(program) {
    const validArg = !!program.args[0];
    const validOptions = !program.download || (program.download && program.download !== true);
    return validArg && validOptions;
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getAccount(token);
    }).then(account => {
      const device = JSON.parse(program.args[0]);
      if (program.download) {
        return this.barracks.checkUpdateAndDownload(account.apiKey, device, program.download);
      } else {
        return this.barracks.checkUpdate(account.apiKey, device);
      }
    });
  }

}

module.exports = CheckUpdateCommand;