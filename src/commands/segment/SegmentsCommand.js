const BarracksCommand = require('../BarracksCommand');

class SegmentsCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getSegments(token);
    });
  }
}

module.exports = SegmentsCommand;
