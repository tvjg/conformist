const test = require('tape-catch')
const env = require('../index.js')()

test('number-specific validations', function (context) {
  context.test('minimum', function (t) {
    let schema, validate, _

    schema = { 'minimum': 1 }
    validate = env.compile(schema)

    t.plan(6)

    _ = validate(1)
    t.equal(_.isSuccess, true)

    _ = validate(2)
    t.equal(_.isSuccess, true)

    _ = validate(0.999)
    t.equal(_.isFailure, true)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    schema = { 'minimum': 1, 'exclusiveMinimum': true }
    validate = env.compile(schema)

    _ = validate(1)
    t.equal(_.isFailure, true)

    _ = validate(2)
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('maximum', function (t) {
    let schema, validate, _

    schema = { 'maximum': 1 }
    validate = env.compile(schema)

    t.plan(6)

    _ = validate(1)
    t.equal(_.isSuccess, true)

    _ = validate(0.999)
    t.equal(_.isSuccess, true)

    _ = validate(1.1)
    t.equal(_.isFailure, true)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    schema = { 'maximum': 1, 'exclusiveMaximum': true }
    validate = env.compile(schema)

    _ = validate(1)
    t.equal(_.isFailure, true)

    _ = validate(0.5)
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('multipleOf', function (t) {
    let schema, validate, _

    schema = { 'multipleOf': 3 }
    validate = env.compile(schema)

    t.plan(4)

    _ = validate(9)
    t.equal(_.isSuccess, true)

    _ = validate(81)
    t.equal(_.isSuccess, true)

    _ = validate(1.1)
    t.equal(_.isFailure, true)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    t.end()
  })
})
