const R = require('ramda')
const {Validation} = require('folktale/data')

const {Success, Failure} = Validation

// ****** string validation ******
function isMinLength (v, p) {
  return typeof v !== 'string' || v.length >= p
}

function isMaxLength (v, p) {
  return typeof v !== 'string' || v.length <= p
}

function isPattern (v, p) {
  if (typeof v !== 'string') return true

  let pattern, modifiers, regex

  if (typeof p === 'string') {
    pattern = p
  } else {
    pattern = p[0]
    modifiers = p[1]
  }

  regex = new RegExp(pattern, modifiers)
  return regex.test(v)
}

// ****** numeric validation ********
function isMinimum (v, p, schema) {
  if (typeof v !== 'number') return true

  let isExclusiveMinimum = R.propOr(false, 'exclusiveMinimum', schema)
  return !(v < p || isExclusiveMinimum && v <= p)
}

function isMaximum (v, p, schema) {
  if (typeof v !== 'number') return true

  let isExclusiveMaximum = R.propOr(false, 'exclusiveMaximum', schema)
  return !(v > p || isExclusiveMaximum && v >= p)
}

function isMultipleOf (v, p) {
  if (typeof v !== 'number') return true

  return ((v / p) % 1) === 0 || typeof v !== 'number'
}

/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */
module.exports = {
  'string': {
    'minLength': (p) => (v) => isMinLength(v, p) ? Success(v) : Failure([{'minLength': null}]),
    'maxLength': (p) => (v) => isMaxLength(v, p) ? Success(v) : Failure([{'maxLength': null}]),
    'pattern':   (p) => (v) => isPattern(v, p)   ? Success(v) : Failure([{'pattern': null}])
  },
  'number': {
    'minimum':    (p, s) => (v) => isMinimum(v, p, s) ? Success(v) : Failure([{'minimum': null}]),
    'maximum':    (p, s) => (v) => isMaximum(v, p, s) ? Success(v) : Failure([{'maximum': null}]),
    'multipleOf': (p)    => (v) => isMultipleOf(v, p) ? Success(v) : Failure([{'multipleOf': null}])
  }
}
/* eslint-enable key-spacing */
/* eslint-enable no-multi-spaces */
