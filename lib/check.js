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

/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */
module.exports = {
  'string': {
    'minLength': (p) => (v) => isMinLength(v, p) ? Success(v) : Failure([{'minLength': null}]),
    'maxLength': (p) => (v) => isMaxLength(v, p) ? Success(v) : Failure([{'maxLength': null}]),
    'pattern':   (p) => (v) => isPattern(v, p)   ? Success(v) : Failure([{'pattern': null}])
  }
}
/* eslint-enable key-spacing */
/* eslint-enable no-multi-spaces */
