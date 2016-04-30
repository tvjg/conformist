const R = require('ramda')
const {Validation} = require('folktale/data')

const {Success} = Validation

// Store a function to be called later
const thunk = ((fn) => {
  return function thunk (aFn) {
    if (aFn === undefined) return fn

    fn = aFn
    return thunk
  }
})()

const isLeaf = () => true

// TODO: Does this hold if we call compile without argument?
const seedFn = (validate) => (target) => validate(target)

const compile = (o) =>
  (function reduce (thunk, queue) {
    let [node, ...rest] = queue
    let priorFn = thunk()

    if (!node) return priorFn

    let validators = []

    let currentFn = ((validators) => {
      return (target) => {
        let seed = Success(R.curryN(validators.length, () => target))
        return validators.reduce((seed, f) => seed.ap(f(target)), seed)
      }
    })(validators)

    if (isLeaf(node)) {
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
