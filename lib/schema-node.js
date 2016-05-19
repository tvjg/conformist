const R = require('ramda')
const {Maybe, Validation} = require('folktale/data')

const {Success, Failure} = Validation

const asArray = R.concat([])
const rejectNils = R.reject(R.isNil)
const keysToGetters = R.compose(R.map(R.propOr(null)), R.keys)
const isSuccess = R.prop('isSuccess')
const anySuccess = (...results) => R.find(isSuccess, results) || Failure([{ 'anyOf': null }])
const onlyOneSuccess = (...results) => ((R.filter(isSuccess, results).length === 1) && R.head(results)) || Failure([{ 'oneOf': null }])
const allSuccess = (...results) => (R.all(isSuccess, results) && R.head(results)) || Failure([{ 'allOf': null }])

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

    let stringKeywords = R.keys(env.fieldValidate.string)
    let stringConstraints = R.pick(stringKeywords, this.schema)
    let stringValidators = R.values(R.mapObjIndexed((v, k) => env.fieldValidate.string[k](v), stringConstraints))

    let numericKeywords = R.keys(env.fieldValidate.number)
    let numericConstraints = R.pick(numericKeywords, this.schema)
    let numericValidators = R.values(R.mapObjIndexed((v, k) => env.fieldValidate.number[k](v, this.schema), numericConstraints))

    let arrayKeywords = R.keys(env.fieldValidate.array)
    let arrayConstraints = R.pick(arrayKeywords, this.schema)
    let arrayValidators = R.values(R.mapObjIndexed((v, k) => env.fieldValidate.array[k](v), arrayConstraints))

    let typeValidators, formatValidators, requiredValidators

    typeValidators = this.prop('type').map(toTypeValidators).getOrElse([])
    formatValidators = this.prop('format').map(toFormatValidators).getOrElse([])
    requiredValidators = this.prop('required').map(toRequiredValidators).getOrElse([])

    this._validators = [].concat(typeValidators, formatValidators, requiredValidators, stringValidators, numericValidators, arrayValidators)
  }

  prop (name) {
    return Maybe.fromNullable(R.prop(name, this.schema))
  }

  combine (childFns) {
    let propertyPartials, propertySlice, propertyValidators
    let notPartials, notSlice, notValidators
    let anyOfCount, anyOfSlice, anyOfValidators
    let oneOfCount, oneOfSlice, oneOfValidators
    let allOfCount, allOfSlice, allOfValidators
    let count = 0

    propertyPartials = this.prop('properties').map(keysToGetters).getOrElse([])
    notPartials = this.prop('not').map(() => [ (m) => m.swap() ]).getOrElse([])
    anyOfCount = this.prop('anyOf').map(R.compose(R.length, asArray)).getOrElse(0)
    oneOfCount = this.prop('oneOf').map(R.compose(R.length, asArray)).getOrElse(0)
    allOfCount = this.prop('allOf').map(R.compose(R.length, asArray)).getOrElse(0)

    propertySlice = R.slice(count, count += propertyPartials.length, childFns)
    notSlice = R.slice(count, count += notPartials.length, childFns)
    anyOfSlice = R.slice(count, count += anyOfCount, childFns)
    oneOfSlice = R.slice(count, count += oneOfCount, childFns)
    allOfSlice = R.slice(count, count += allOfCount, childFns)

    propertyValidators = R.zipWith(R.compose, propertySlice, propertyPartials)
    notValidators = R.zipWith(R.compose, notPartials, notSlice)
    anyOfValidators = (anyOfCount > 0) ? [R.converge(anySuccess, anyOfSlice)] : []
    oneOfValidators = (oneOfCount > 0) ? [R.converge(onlyOneSuccess, oneOfSlice)] : []
    allOfValidators = (allOfCount > 0) ? [R.converge(allSuccess, allOfSlice)] : []

    return this.validators.concat(propertyValidators, notValidators, anyOfValidators, oneOfValidators, allOfValidators)
  }

  get validators () {
    return this._validators
  }

  get children () {
    let properties, not, anyOf, oneOf, allOf
    // FIXME Do we ever backtrack? Is schema stack needed?
    let collectChildren = R.map((s) => ({ env: this.env, schemaStack: [s] }))

    properties = this.prop('properties').map(R.compose(collectChildren, R.values)).getOrElse([])
    not = this.prop('not').map(R.compose(collectChildren, asArray)).getOrElse([])
    anyOf = this.prop('anyOf').map(R.compose(collectChildren, asArray)).getOrElse([])
    oneOf = this.prop('oneOf').map(R.compose(collectChildren, asArray)).getOrElse([])
    allOf = this.prop('allOf').map(R.compose(collectChildren, asArray)).getOrElse([])

    return [].concat(properties, not, anyOf, oneOf, allOf)
  }

  get isLeaf () {
    return this.children.length === 0
  }
}

SchemaNode.from = (n) => new SchemaNode(n)

module.exports = SchemaNode
