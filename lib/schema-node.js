const R = require('ramda')
const {Maybe} = require('folktale/data')

const asArray = R.concat([])
const rejectNils = R.reject(R.isNil)

class SchemaNode {
  constructor ({env, schemaStack}) {
    // TODO: I don't think this should ever be empty. Verify.
    this.schema = R.head(schemaStack)

    let toTypeValidators = R.compose(rejectNils, R.map((t) => env.types[t]), asArray)
    let toFormatValidators = R.compose(rejectNils, R.map((f) => env.formats[f]), asArray)

    let typeValidators, formatValidators

    typeValidators = this.prop('type').map(toTypeValidators).getOrElse([])
    formatValidators = this.prop('format').map(toFormatValidators).getOrElse([])

    this._validators = typeValidators.concat(formatValidators)
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
