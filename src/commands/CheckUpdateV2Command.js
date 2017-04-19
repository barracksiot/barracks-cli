const BarracksCommand = require('./BarracksCommand');
const Validator = require('../utils/Validator');

function buildDevice(program) {
  const device = {
    unitId: program.unitId,
    packages: JSON.parse(program.packages)
  };
  if (program.customClientData) {
    device.customClientData = JSON.parse(program.customClientData);  
  }
  return device;
}

class CheckUpdateV2Command extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--unitId [unitId]', 'The unit id of the device that do the check update')
      .option('--packages [packages]', 'A JSON array containing the list of packages installed on the device')
      .option('--customClientData [customClientData]', '(Optionnal) A valid JSON string containing the custom client data of the device');
  }

  validateCommand(program) {
    return !!(
      program.unitId && program.unitId !== true &&
      program.packages && program.packages !== true && Validator.isJsonArray(program.packages) &&
      (!program.customClientData || (program.customClientData && program.customClientData !== true))
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getAccount(token);
    }).then(account => {
      const device = buildDevice(program);
      return this.barracks.resolveDevicePackages(account.apiKey, device);
    });
  }
}

module.exports = CheckUpdateV2Command;
