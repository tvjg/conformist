const util = require('util')
const R = require('ramda')
const Reader = require('fantasy-readers')
const JsonRefs = require('json-refs')

const {unfoldTreeM} = require('./lib/data/tree')
// Helpers
const log = console.log.bind(console)
const print = (v) => log(util.inspect(v, { depth: null }))

const isParent = [
  'not',
  'allOf',
  'oneOf',
  'anyOf'
]

const {compose, concat} = R
const {pick, keys} = R
const {lensPath, view} = R

const getChildren = compose(keys, pick(isParent))

// spoolM :: Monad m => b -> m (a, [b])
let spoolJsonSchema = (path) => {
  return Reader.ask.map((env) => {
    let ptr = JsonRefs.pathToPtr(path)
    let lens = lensPath(path)
    let fragment = view(lens, env.schema)
    let children = getChildren(fragment)
    let next = children.map(concat(path))

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
