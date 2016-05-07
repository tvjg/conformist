const R = require('ramda')
const {Validation} = require('folktale/data')
const SchemaNode = require('./schema-node')

const {Success} = Validation

// FIXME: Only one thunk for all instances
// Store a function to be called later
const thunk = ((fn) => {
  return function thunk (aFn) {
    if (aFn === undefined) return fn

    fn = aFn
    return thunk
  }
})()

// FIXME: Always terminate early for now
const isLeaf = () => true

// TODO: Does this hold if we call compile without argument?
const seedFn = (validate) => (target) => validate(target)

const compile = (o) =>
  (function reduce (thunk, queue) {
    let [first, ...rest] = queue
    let priorFn = thunk()

    if (!first) return priorFn

    let node = SchemaNode.from(first)

    let currentFn = ((validators) => {
      return (target) => {
        let seed = Success(R.curryN(validators.length, () => target))
        return validators.reduce((seed, f) => seed.ap(f(target)), seed)
      }
    })(node.validators)

    if (isLeaf(first)) {
      return reduce(thunk(priorFn(currentFn)), rest)
    }

    let childNodes = {}
    let processingOrder = []

    let curriedFn = ((priorFn, currentFn, childNodes) => {
      return R.curryN(processingOrder.length, (...childFns) => {
        let validators = []

        let fn = (target) => {
          let seed = Success(R.curryN(validators.length, () => target))
          return validators.reduce((seed, f) => seed.ap(f(target)), seed)
        }

        return priorFn(fn)
      })
    })(priorFn, currentFn, childNodes)

    return reduce(thunk(curriedFn), processingOrder.concat(rest))
  }(thunk(seedFn), [o]))

module.exports = compile
