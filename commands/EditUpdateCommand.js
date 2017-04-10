const Validator = require('../utils/Validator');
const BarracksCommand = require('./BarracksCommand');

function extractOptions(program, fields) {
  const options = {};
  fields.forEach(field => {
    if (program[field] && program[field] !== true) {
      options[field] = program[field];
    }
  });
  return options;
}

function buildDiff(program) {
  const extractedOptions = extractOptions(program, ['title', 'description', 'segment', 'properties']);
  const diff = Object.assign({}, extractedOptions, {
    uuid: program.args[0],
    name: extractedOptions.title,
    title: undefined,
    properties: undefined
  });

  if (extractedOptions.properties) {
    diff.additionalProperties = JSON.parse(extractedOptions.properties);
  } else {
    diff.additionalProperties = undefined;
  }

  return diff;
}

function removeEmptyAttributes(object) {
  return JSON.parse(JSON.stringify(object));
}

function buildUpdateDiff(command, token, program) {
  return new Promise((resolve, reject) => {
    const diff = buildDiff(program);
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
      resolve(removeEmptyAttributes(diff));
    }
  });
}

function atLeastOneGiven(program, fields) {
  return fields.reduce((found, item) => {
      return found || !!program[item];
    }, false);
}

class EditUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<update-uuid>')
      .option('--title [value]', '(Optionnal) The title of the update')
      .option('--description [value]', '(Optionnal) The description of the update')
      .option('--segment [name]', '(Optionnal) The segment for which you want to create the update')
      .option('--properties [json]', '(Optionnal) The custom data you want to associate with the update (must be a valid JSON)');
  }

  validateCommand(program) {
    const options = ['title', 'description', 'segment', 'properties'];
    return !!(
      program.args[0] && program.args[0] !== true &&
      this.validateOptionnalParams(program, options) &&
      atLeastOneGiven(program, options) &&
      (!program.properties || Validator.isJsonString(program.properties))
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
