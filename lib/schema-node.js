const R = require('ramda')
const {Maybe, Validation} = require('folktale/data')

const {Success, Failure} = Validation

const asArray = R.concat([])
const rejectNils = R.reject(R.isNil)
const keysToGetters = R.compose(R.map(R.propOr(null)), R.keys)

// TODO: Should live elsewhwere
const required = (p) => (o) => o.hasOwnProperty(p) ? Success(o) : Failure([{'required': p}])

class SchemaNode {
  constructor ({env, schemaStack}) {
    // TODO: I don't think this should ever be empty. Verify.
    this.schema = R.head(schemaStack)
    this.env = env

    let toTypeValidators = R.compose(rejectNils, R.map((t) => env.types[t]), asArray)
    let toFormatValidators = R.compose(rejectNils, R.map((f) => env.formats[f]), asArray)
    let toRequiredValidators = R.compose(rejectNils, R.map((p) => required(p)), asArray)

    let stringConstraints = R.pick(R.keys(env.fieldValidate.string), this.schema)
    let stringValidators = R.values(R.mapObjIndexed((v, k) => env.fieldValidate.string[k](v), stringConstraints))

    let typeValidators, formatValidators, requiredValidators

    typeValidators = this.prop('type').map(toTypeValidators).getOrElse([])
    formatValidators = this.prop('format').map(toFormatValidators).getOrElse([])
    requiredValidators = this.prop('required').map(toRequiredValidators).getOrElse([])

    this._validators = [].concat(typeValidators, formatValidators, requiredValidators, stringValidators)
  }

  prop (name) {
    return Maybe.fromNullable(R.prop(name, this.schema))
  }

  combine (childFns) {
    let propertyPartials, propertySlice, propertyValidators
    let notPartials, notSlice, notValidators
    let count = 0

    propertyPartials = this.prop('properties').map(keysToGetters).getOrElse([])
    notPartials = this.prop('not').map(() => [ (m) => m.swap() ]).getOrElse([])

    propertySlice = R.slice(count, count += propertyPartials.length, childFns)
    notSlice = R.slice(count, count += notPartials.length, childFns)

    propertyValidators = R.zipWith(R.compose, propertySlice, propertyPartials)
    notValidators = R.zipWith(R.compose, notPartials, notSlice)

    return this.validators.concat(propertyValidators, notValidators)
  }

  get validators () {
    return this._validators
  }

  get children () {
    let properties, not
    // FIXME Do we ever backtrack? Is schema stack needed?
    let collectChildren = R.map((s) => ({ env: this.env, schemaStack: [s] }))

    properties = this.prop('properties').map(R.compose(collectChildren, R.values)).getOrElse([])
    not = this.prop('not').map(R.compose(collectChildren, asArray)).getOrElse([])

    return [].concat(properties, not)
  }

  get isLeaf () {
    return this.children.length === 0
  }
}

SchemaNode.from = (n) => new SchemaNode(n)

module.exports = SchemaNode
