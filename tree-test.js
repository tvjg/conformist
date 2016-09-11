const util = require('util')
const {tagged, taggedSum} = require('daggy')
const R = require('ramda')
const {compose, map, partial, pick, keys} = R
const {mapM} = require('control.monads')
const Reader = require('fantasy-readers');
const JsonRefs = require('json-refs')

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
}

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

// To test foldMap
const Sum = tagged('x')

Sum.prototype.concat = function (a) {
  return Sum(a.x + this.x)
}

Sum.empty = Sum(0)

const SchemaFragment = () => ({
  concat: () => {}
})

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

// Monadic tree builder, in depth-first order
// unfoldTreeM :: Monad m => (b -> m (a, [b])) -> b -> m (Tree a)
// unfoldTreeM f b = do
//     (a, bs) <- f b
//     ts <- unfoldForestM f bs
//     return (Node a ts)
function unfoldTreeM (type, f, seed) {
  return f(seed)
    .chain(([x, seeds]) => unfoldForestM(type, f, seeds)
      .chain((ts) => type.of(Tree.Node(x, ts))))
}

// -- | Monadic forest builder, in depth-first order
// unfoldForestM :: Monad m => (b -> m (a, [b])) -> [b] -> m (Forest a)
// unfoldForestM f = Prelude.mapM (unfoldTreeM f)
function unfoldForestM (type, f, seeds) {
  return mapM(type, partial(unfoldTreeM, [type, f]), seeds)
}

// Example
// spool :: Int -> (b -> (a, [b])
let spoolBinary = (depth) => (b) => {
  let next = (b < Math.pow(2, depth) - 1)
        ? [2*b+1, 2*b+2]
        : []

  return [b, next]
}

let t = unfoldTree(spoolBinary(1), 0).map(x => x + 1)

print(t)

let s1 = t.foldMap(Sum, Sum.empty)

// assert.equal(s1.x, 6)

// Example
const isParent = [
  'not',
  'allOf',
  'oneOf',
  'anyOf'
]

const getChildren = compose(keys, pick(isParent))

// spoolM :: Monad m => b -> m (a, [b])
let spoolJsonSchema = (b) => {
  return Reader.ask.map((env) => {
    let ptr = JsonRefs.pathToPtr(b)
    let lens = R.lensPath(b)
    let fragment = R.view(lens, env.schema)
    let children = getChildren(fragment)
    let next = children.map(R.concat(b))

    return [ptr, next]
  })
}

let schema = {
  not: { type: 'string' }
}

let t2 = unfoldTreeM(Reader, spoolJsonSchema, []).run({ schema })

print(t2)

// Verify we have a proper Tree type
print(t2.map(JsonRefs.pathFromPtr))
