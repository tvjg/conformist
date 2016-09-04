const util = require('util')
const {tagged, taggedSum} = require('daggy')
const {map, partial} = require('ramda')

// Helpers
const log = console.log.bind(console)
const print = (v) => log(util.inspect(v, { depth: null }))

// ADT
const Tree = taggedSum({
  Node: ['x', 'forest']
})

// fmapTree :: (a -> b) -> Tree a -> Tree b
// fmapTree f (Node x ts) = Node (f x) (map (fmapTree f) ts)
Tree.prototype.map = function (f) {
  let {x, forest} = this
  return Tree.Node(f(x), forest.map((t) => t.map(f)))
};

// foldMap :: (Foldable t, Monoid m) => (a -> m) -> t a -> m
// foldMap f (Node x ts) = f x `mappend` foldMap (foldMap f) ts
Tree.prototype.foldMap = function (f, empty) {
  return this.cata({
    Node: function(x, forest) {
      let results = forest
            .map((t) => t.foldMap(f, empty))
            .reduce((acc, x) => acc.concat(x), empty)
      
      return f(x).concat(results)
    }
  })
}

// For testing foldMap
const Sum = tagged('x')

Sum.prototype.concat = function (a) {
  return Sum(a.x + this.x)
}

Sum.empty = Sum(0)

// Build a tree from a seed value
// unfoldTree :: (b -> (a, [b])) -> b -> Tree a
// unfoldTree f b = let (a, bs) = f b in Node a (unfoldForest f bs)
function unfoldTree (f, seed) {
  let [x, seeds] = f(seed)
  return Tree.Node(x, unfoldForest(f, seeds))
}

// Build a forest from a list of seed values
// unfoldForest :: (b -> (a, [b])) -> [b] -> Forest a
// unfoldForest f = map (unfoldTree f)
function unfoldForest (f, seeds) {
  return map(partial(unfoldTree, [f]), seeds)
}

// Example
// spool :: Int -> b -> (a, [b])
let spoolBinary = (depth) => (b) => {
  let next = (b < Math.pow(2, depth) - 1)
        ? [2*b+1, 2*b+2]
        : []

  return [b, next]
}

let t = unfoldTree(spoolBinary(1), 0).map(x => x + 1)

print(t)

let s1 = t.foldMap(Sum, Sum.empty)

assert.equal(s1.x, 6)
