const BarracksCommand = require('../BarracksCommand');

class FiltersCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getFilters(token);
    });
  }
}

module.exports = FiltersCommand;
