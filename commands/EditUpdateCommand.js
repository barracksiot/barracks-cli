const BarracksCommand = require('./BarracksCommand');

function extractOptions(program, fields) {
  const options = {};
  fields.forEach(field => {
    if (program[field] && program[field] !== true && typeof program[field] !== 'function') {
      options[field] = program[field];
    }
  });
  return options;
}

function removeEmptyAttributes(object) {
  return JSON.parse(JSON.stringify(object));
}

function buildUpdateDiff(command, token, program) {
  return new Promise((resolve, reject) => {
    const extractedOptions = extractOptions(program, ['uuid', 'title', 'description', 'segment', 'properties']);
    const diff = Object.assign({}, extractedOptions, {
      name: extractedOptions.title,
      additionalProperties: JSON.parse(extractedOptions.properties),
      title: undefined,
      properties: undefined
    });
    if (diff.segment) {
      return command.barracks.getSegmentByName(token, diff.segment).then(segment => {
        resolve(removeEmptyAttributes(Object.assign({}, diff, { 
          segmentId: segment.id,
          segment: undefined
        })));
      }).catch(err => {
        reject(err);
      });
    } else {
      resolve(diff);
    }
  });
}

class EditUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--uuid [value]', 'The uuid of the update')
      .option('--title [value]', '(Optionnal) The title of the update')
      .option('--description [value]', '(Optionnal) The description of the update')
      .option('--segment [name]', '(Optionnal) The segment for which you want to create the update')
      .option('--properties [json]', '(Optionnal) The custom data you want to associate with the update (must be a valid JSON)');
  }

  validateCommand(program) {
    return !!(
      program.uuid && program.uuid !== true
    );
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return buildUpdateDiff(this, token, program);
    }).then(updateDiff => {
      return this.barracks.editUpdate(token, updateDiff);
    });
  }

}

module.exports = EditUpdateCommand;
