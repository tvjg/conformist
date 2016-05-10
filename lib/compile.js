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

// TODO: Does this hold if we call compile without argument?
const seedFn = (validate) => (target) => validate(target)

const compile = (o) =>
  (function reduce (thunk, queue) {
    let [first, ...rest] = queue
    let priorFn = thunk()

    if (!first) return priorFn

    {
      let node, nextFn

      node = SchemaNode.from(first)

      nextFn = R.curryN(node.children.length, (...childFns) => {
        let validators, validateNode

        validators = node.combine(childFns)

        validateNode = (target) => {
          let seed = Success(R.curryN(validators.length, () => target))
          return validators.reduce((seed, f) => seed.ap(f(target)), seed)
        }

        return priorFn(validateNode)
      })

      if (node.isLeaf) nextFn = nextFn()

      return reduce(thunk(nextFn), node.children.concat(rest))
    }
  }(thunk(seedFn), [o]))

module.exports = compile
