const BarracksCommand = require('./BarracksCommand');

function buildDevice(program) {
  const device = {
    unitId: program.unitId,
    versionId: program.versionId,
  };
  if (program.customClientData) {
    device.customClientData = JSON.parse(program.customClientData);  
  }
  return device;
}

class CheckUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--unitId [unitId]', 'The unit id of the device that do the check update')
      .option('--versionId [versionId]', 'The current version id of the device that do the check update')
      .option('--customClientData [customClientData]', '(Optionnal) A valid JSON string containing the custom client data of the device')
      .option('--download [path]', '(Optionnal) If an update is available, download the package associated to the specified folder');
  }

  validateCommand(program) {
    return !!(
      program.unitId && program.unitId !== true &&
      program.versionId && program.versionId !== true &&
      (!program.customClientData || (program.customClientData && program.customClientData !== true)) &&
      (!program.download || (program.download && program.download !== true))
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getAccount(token);
    }).then(account => {
      const device = buildDevice(program);
      if (program.download) {
        return this.barracks.checkUpdateAndDownload(account.apiKey, device, program.download);
      } else {
        return this.barracks.checkUpdate(account.apiKey, device);
      }
    });
  }
}

module.exports = CheckUpdateCommand;