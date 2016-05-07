const R = require('ramda')
const {Maybe, Validation} = require('folktale/data')

const {Success, Failure} = Validation

const asArray = R.concat([])
const rejectNils = R.reject(R.isNil)

// TODO: Should live elsewhwere
const required = (p) => (o) => o.hasOwnProperty(p) ? Success(o) : Failure([{'required': p}])

class SchemaNode {
  constructor ({env, schemaStack}) {
    // TODO: I don't think this should ever be empty. Verify.
    this.schema = R.head(schemaStack)

    let toTypeValidators = R.compose(rejectNils, R.map((t) => env.types[t]), asArray)
    let toFormatValidators = R.compose(rejectNils, R.map((f) => env.formats[f]), asArray)
    let toRequiredValidators = R.compose(rejectNils, R.map((p) => required(p)), asArray)

    let typeValidators, formatValidators, requiredValidators

    typeValidators = this.prop('type').map(toTypeValidators).getOrElse([])
    formatValidators = this.prop('format').map(toFormatValidators).getOrElse([])
    requiredValidators = this.prop('required').map(toRequiredValidators).getOrElse([])

    this._validators = typeValidators.concat(formatValidators, requiredValidators)
  }

  prop (name) {
    return Maybe.fromNullable(R.prop(name, this.schema))
  }

  get validators () {
    return this._validators
  }

  get children () {

  }
}

SchemaNode.from = (n) => new SchemaNode(n)

module.exports = SchemaNode
