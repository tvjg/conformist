const R = require('ramda')
const {Maybe, Validation} = require('folktale/data')
const isPlainObject = require('lodash.isplainobject')

const {Success, Failure} = Validation

const asArray = R.concat([])
const rejectNils = R.reject(R.isNil)
const keysToGetters = R.compose(R.map(R.propOr(null)), R.keys)
const padArray = (n, arr) => (arr.length >= n) ? arr : arr.concat(Array(n - arr.length))
const onlyPlainObjects = R.filter(isPlainObject)

// TODO Is R.unapply(R.identity) more clear?
const collectArgs = (...args) => args
const isSuccess = R.prop('isSuccess')
const orFail = (keyword) => (v) => v || Failure([{ [keyword]: null }])

const exactlyOneItem = R.compose(R.equals(1), R.length)
const ifExactlyOneGet = R.cond([[exactlyOneItem, R.head]])
const ifAllSuccessGet = R.cond([[R.all(isSuccess), R.head]])
const anySuccess = R.pipe(collectArgs, R.find(isSuccess), orFail('anyOf'))
const oneSuccess = R.pipe(collectArgs, R.filter(isSuccess), ifExactlyOneGet, orFail('oneOf'))
const allSuccess = R.pipe(collectArgs, ifAllSuccessGet, orFail('allOf'))

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

    let typeValidators, formatValidators, requiredValidators

    typeValidators = this.prop('type').map(toTypeValidators).getOrElse([])
    formatValidators = this.prop('format').map(toFormatValidators).getOrElse([])
    requiredValidators = this.prop('required').map(toRequiredValidators).getOrElse([])

    let keywords, constraints, otherValidators

    keywords = R.keys(env.fieldValidate)
    constraints = R.pick(keywords, this.schema)
    otherValidators = R.values(R.mapObjIndexed((v, k) => env.fieldValidate[k](v, this.schema), constraints))

    this._validators = [].concat(typeValidators, formatValidators, requiredValidators, otherValidators)
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
    let itemsCount, itemsSlice, itemsValidators
    let additionalItemsCount, additionalItemsSlice
    let count = 0

    propertyPartials = this.prop('properties').map(keysToGetters).getOrElse([])
    notPartials = this.prop('not').map(() => [ (m) => m.swap() ]).getOrElse([])
    anyOfCount = this.prop('anyOf').map(R.compose(R.length, asArray)).getOrElse(0)
    oneOfCount = this.prop('oneOf').map(R.compose(R.length, asArray)).getOrElse(0)
    allOfCount = this.prop('allOf').map(R.compose(R.length, asArray)).getOrElse(0)
    itemsCount = this.prop('items').map(R.compose(R.length, asArray)).getOrElse(0)
    additionalItemsCount = this.prop('additionalItems').map(R.compose(R.length, onlyPlainObjects, asArray)).getOrElse(0)

    propertySlice = R.slice(count, count += propertyPartials.length, childFns)
    notSlice = R.slice(count, count += notPartials.length, childFns)
    anyOfSlice = R.slice(count, count += anyOfCount, childFns)
    oneOfSlice = R.slice(count, count += oneOfCount, childFns)
    allOfSlice = R.slice(count, count += allOfCount, childFns)
    itemsSlice = R.slice(count, count += itemsCount, childFns)
    additionalItemsSlice = R.slice(count, count += additionalItemsCount, childFns)

    let itemsIsSchema = (ary) => {
      let seed = Success(R.curryN(ary.length, R.always(ary)))
      let validate = R.head(itemsSlice)
      return R.transduce(R.map(validate), R.ap, seed, ary)
    }

    let itemsIsArray = (ary) => {
      let seed = Success(R.curryN(itemsSlice.length, R.always(ary)))
      let padded = padArray(itemsSlice.length, ary)
      let results = R.zipWith(R.call, itemsSlice, padded)
      return R.reduce(R.ap, seed, results)
    }

    let validateAdditionalItems = R.liftN(2, (items, additionalItems) => (ary) => {
      let validate = R.head(additionalItemsSlice)

      if (validate) {
        let arySlice = ary.slice(items.length)
        let seed = Success(R.curryN(arySlice.length, R.always(ary)))
        return R.transduce(R.map(validate), R.ap, seed, arySlice)
      }

      if (additionalItems === false && ary.length > items.length) {
        return Failure([{ additionalItems: null }])
      }

      return Success(ary)
    })(this.prop('items'), this.prop('additionalItems')).getOrElse(Success)

    // FIXME This doesn't work right. Will report items failures as additionalItems fails
    let allItemsSuccess = R.pipe(collectArgs, ifAllSuccessGet, orFail('additionalItems'))

    let validateArray = this.prop('items').map(R.ifElse(
      Array.isArray,
      R.always(R.converge(allItemsSuccess, [itemsIsArray, validateAdditionalItems])),
      R.always(itemsIsSchema)
    )).getOrElse(null)

    propertyValidators = R.zipWith(R.compose, propertySlice, propertyPartials)
    notValidators = R.zipWith(R.compose, notPartials, notSlice)
    anyOfValidators = (anyOfCount > 0) ? [R.converge(anySuccess, anyOfSlice)] : []
    oneOfValidators = (oneOfCount > 0) ? [R.converge(oneSuccess, oneOfSlice)] : []
    allOfValidators = (allOfCount > 0) ? [R.converge(allSuccess, allOfSlice)] : []
    itemsValidators = (itemsCount > 0) ? [R.ifElse(Array.isArray, validateArray, Success)] : []

    return this.validators.concat(propertyValidators, notValidators, anyOfValidators, oneOfValidators, allOfValidators, itemsValidators)
  }

  get validators () {
    return this._validators
  }

  get children () {
    let properties, not, anyOf, oneOf, allOf, items, additionalItems
    // FIXME Do we ever backtrack? Is schema stack needed?
    let collectChildren = R.map((s) => ({ env: this.env, schemaStack: [s] }))

    properties = this.prop('properties').map(R.compose(collectChildren, R.values)).getOrElse([])
    not = this.prop('not').map(R.compose(collectChildren, asArray)).getOrElse([])
    anyOf = this.prop('anyOf').map(R.compose(collectChildren, asArray)).getOrElse([])
    oneOf = this.prop('oneOf').map(R.compose(collectChildren, asArray)).getOrElse([])
    allOf = this.prop('allOf').map(R.compose(collectChildren, asArray)).getOrElse([])
    items = this.prop('items').map(R.compose(collectChildren, asArray)).getOrElse([])
    additionalItems = this.prop('additionalItems').map(R.compose(collectChildren, onlyPlainObjects, asArray)).getOrElse([])

    return [].concat(properties, not, anyOf, oneOf, allOf, items, additionalItems)
  }

  get isLeaf () {
    return this.children.length === 0
  }
}

SchemaNode.from = (n) => new SchemaNode(n)

module.exports = SchemaNode
