const test = require('tape-catch')
const env = require('../index.js')()

test('array-specific validations', function (context) {
  context.test('minItems', function (t) {
    let schema, validate, _

    schema = { 'minItems': 1 }
    validate = env.compile(schema)

    t.plan(3)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    _ = validate([true])
    t.equal(_.isSuccess, true)

    _ = validate([])
    t.equal(_.isFailure, true)

    t.end()
  })

  context.test('maxItems', function (t) {
    let schema, validate, _

    schema = { 'maxItems': 1 }
    validate = env.compile(schema)

    t.plan(3)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    _ = validate([true])
    t.equal(_.isSuccess, true)

    _ = validate([1, 2])
    t.equal(_.isFailure, true)

    t.end()
  })

  context.test('uniqueItems', function (t) {
    let schema, validate, _

    schema = { 'uniqueItems': true }
    validate = env.compile(schema)

    t.plan(6)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    _ = validate([true, false])
    t.equal(_.isSuccess, true)

    _ = validate([1, 1])
    t.equal(_.isFailure, true)

    schema = { 'uniqueItems': false }
    validate = env.compile(schema)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    _ = validate([true, false])
    t.equal(_.isSuccess, true)

    _ = validate([1, 1])
    t.equal(_.isSuccess, true)

    t.end()
  })
})
