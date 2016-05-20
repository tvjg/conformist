const R = require('ramda')
const {Validation} = require('folktale/data')
const isPlainObject = require('lodash.isplainobject')

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

// ***** array validation *****
function hasMinItems (v, p) {
  return !Array.isArray(v) || v.length >= p
}

function hasMaxItems (v, p) {
  return !Array.isArray(v) || v.length <= p
}

function hasUniqueItems (v, p) {
  if (!p || !Array.isArray(v)) return true

  let key
  let hash = {}

  for (let i = 0, len = v.length; i < len; i++) {
    key = JSON.stringify(v[i])
    if (hash.hasOwnProperty(key)) {
      return false
    } else {
      hash[key] = true
    }
  }

  return true
}

// ***** object validation ****
function hasMinProps (v, p) {
  if (!isPlainObject(v)) return true
  return R.keys(v).length >= p
}

function hasMaxProps (v, p) {
  if (!isPlainObject(v)) return true
  return R.keys(v).length <= p
}

// ***** all *****
function isEnum (v, p) {
  let i, len, vs

  if (typeof v === 'object') {
    vs = JSON.stringify(v)
    for (i = 0, len = p.length; i < len; i++) {
      if (vs === JSON.stringify(p[i])) return true
    }
  } else {
    for (i = 0, len = p.length; i < len; i++) {
      if (v === p[i]) return true
    }
  }

  return false
}

/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */
module.exports = {
  'minLength':     (p)    => (v) => isMinLength(v, p)    ? Success(v) : Failure([{'minLength': null}]),
  'maxLength':     (p)    => (v) => isMaxLength(v, p)    ? Success(v) : Failure([{'maxLength': null}]),
  'pattern':       (p)    => (v) => isPattern(v, p)      ? Success(v) : Failure([{'pattern': null}]),
  'minimum':       (p, s) => (v) => isMinimum(v, p, s)   ? Success(v) : Failure([{'minimum': null}]),
  'maximum':       (p, s) => (v) => isMaximum(v, p, s)   ? Success(v) : Failure([{'maximum': null}]),
  'multipleOf':    (p)    => (v) => isMultipleOf(v, p)   ? Success(v) : Failure([{'multipleOf': null}]),
  'minItems':      (p)    => (v) => hasMinItems(v, p)    ? Success(v) : Failure([{'minItems': null}]),
  'maxItems':      (p)    => (v) => hasMaxItems(v, p)    ? Success(v) : Failure([{'maxItems': null}]),
  'uniqueItems':   (p)    => (v) => hasUniqueItems(v, p) ? Success(v) : Failure([{'uniqueItems': null}]),
  'minProperties': (p)    => (v) => hasMinProps(v, p)    ? Success(v) : Failure([{'minProperties': null}]),
  'maxProperties': (p)    => (v) => hasMaxProps(v, p)    ? Success(v) : Failure([{'maxProperties': null}]),
  'enum':          (p)    => (v) => isEnum(v, p)         ? Success(v) : Failure([{'enum': null}])
}
/* eslint-enable key-spacing */
/* eslint-enable no-multi-spaces */
