const type = require('./type')
const format = require('./format')
const fieldValidate = require('./check')
const logical = require('./logical')
const compile = require('./compile')

const defaultOptions = {
  useDefault: false,
  useCoerce: false,
  checkRequired: true,
  removeAdditional: false
}

function Environment () {
  if (!(this instanceof Environment)) {
    return new Environment()
  }

  this.coerceType = {}

  this.types = Object.assign({}, type)
  this.formats = Object.assign({}, format)
  this.fieldValidate = Object.assign({}, fieldValidate)
  this.logical = Object.assign({}, logical)

  this.defaultOptions = Object.assign({}, defaultOptions)

  this.schema = {}
}

Environment.prototype = {
  compile: function (schema, options) {
    // TODO: Move this to the Environment constructor I think
    let schemaStack = [schema]

    return compile({
      env: this,
      schemaStack: schemaStack,
      options: Object.assign({}, this.defaultOptions, options)
    })
  },

  addType: function (name, func) {
    this.types[name] = func
  },

  // TODO: Restore this functionality
  addTypeCoercion: function (type, func) {
    this.coerceType[type] = func
  },

  // TODO: Restore this functionality
  addCheck: function (name, func) {
    this.fieldValidate[name] = func
  },

  addFormat: function (name, func) {
    this.formats[name] = func
  }

}

module.exports = Environment
