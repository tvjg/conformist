const {Validation} = require('folktale/data')

const {Success, Failure} = Validation

/* eslint-disable key-spacing */
const test = {
  'null':    (x) => x === null,
  'string':  (x) => typeof x === 'string',
  'boolean': (x) => typeof x === 'boolean',
  'number':  (x) => typeof x === 'number' && !isNaN(x),
  'integer': (x) => typeof x === 'number' && (x % 1 === 0),
  'object':  (x) => x && typeof x === 'object' && !Array.isArray(x),
  'array':   (x) => Array.isArray(x),
  'date':    (x) => x instanceof Date
}

/* eslint-disable no-multi-spaces */
module.exports = {
  'null':     (a) => test['null'](a)    ? Success(a) : Failure([{'type': 'null'}]),
  'string':   (a) => test['string'](a)  ? Success(a) : Failure([{'type': 'string'}]),
  'boolean':  (a) => test['boolean'](a) ? Success(a) : Failure([{'type': 'boolean'}]),
  'number':   (a) => test['number'](a)  ? Success(a) : Failure([{'type': 'number'}]),
  'integer':  (a) => test['integer'](a) ? Success(a) : Failure([{'type': 'integer'}]),
  'object':   (a) => test['object'](a)  ? Success(a) : Failure([{'type': 'object'}]),
  'array':    (a) => test['array'](a)   ? Success(a) : Failure([{'type': 'array'}]),
  'date':     (a) => test['date'](a)    ? Success(a) : Failure([{'type': 'date'}])
}
/* eslint-enable key-spacing */
/* eslint-enable no-multi-spaces */
