const prettyRenderer = require('../renderers/prettyRenderer');
const jsonRenderer = require('../renderers/jsonRenderer');
const program = require('commander');
const Barracks = require('../clients/Barracks');
const UserConfiguration = require('../repositories/UserConfiguration');
const config = require('../config');

class BarracksCommand {

  constructor() {
    this.configureCommand(program)
      .option('--json', 'Display result in json format')
      .parse(process.argv);
    this.userConfiguration = new UserConfiguration(config.userConfig);
    this.barracks = new Barracks(config.barracks);
  }

  configureCommand(program) {
    return program;
  }

  getAuthenticationToken() {
    return this.userConfiguration.getAuthenticationToken();
  }

  saveAuthenticationToken(token) {
    return this.userConfiguration.saveAuthenticationToken(token);
  }

  render() {
    const result = this.execute(program);
    if (program.json) {
      jsonRenderer(result);
    } else {
      prettyRenderer(result);
    }
  }

}

module.exports = BarracksCommand;