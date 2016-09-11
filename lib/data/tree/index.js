const {taggedSum} = require('daggy')
const {map, partial} = require('ramda')
const {mapM} = require('control.monads')

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
    Node: function (x, forest) {
      let results = forest
            .map((t) => t.foldMap(f, empty))
            .reduce((acc, x) => acc.concat(x), empty)

      return f(x).concat(results)
    }
  })
}

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

module.exports = {
  Tree,
  unfoldTree,
  unfoldForest,
  unfoldTreeM,
  unfoldForestM
}
