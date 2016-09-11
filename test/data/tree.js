const test = require('tape-catch')
const {tagged} = require('daggy')
const {Tree, unfoldTree} = require('../../lib/data/tree')

const Sum = tagged('x')

Sum.empty = Sum(0)

Sum.prototype.concat = function (a) {
  return Sum(a.x + this.x)
}

test('data.tree', function (context) {
  context.test('unfoldTree', function (t) {
    let tree

    t.plan(1)

    tree = makeTree()
    t.ok(tree instanceof Tree, 'constructs a Tree from a seed')

    t.end()
  })

  context.test('map', function (t) {
    let tree

    t.plan(1)

    tree = makeTree().map((x) => x + 1)
    t.ok(tree instanceof Tree, 'results in a transformed Tree')

    t.end()
  })

  context.test('foldMap', function (t) {
    let tree, sum

    t.plan(1)

    sum = makeTree().foldMap(Sum, Sum.empty)
    t.equal(sum.x, 3, 'with a Sum type results in 3')

    t.end()
  })
})

function makeTree () {
  // spoolBinary :: Int -> (b -> (a, [b])
  const spoolBinary = (depth) => (b) => {
    let next = (b < Math.pow(2, depth) - 1)
          ? [2 * b + 1, 2 * b + 2]
          : []

    return [b, next]
  }

  return unfoldTree(spoolBinary(1), 0)
}
