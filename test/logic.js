const test = require('tape')
const env = require('../index.js')()

test('logic', function (context) {
  context.test('not', function (t) {
    let schema, validate, _

    schema = { not: { type: 'string' } }
    validate = env.compile(schema)

    t.plan(5)

    _ = validate('a42')
    t.equal(_.isFailure, true)

    _ = validate(false)
    t.equal(_.isSuccess, true)

    _ = validate(1)
    t.equal(_.isSuccess, true)

    schema = {
      type: 'object',
      properties: {
        a: { not: { type: 'string' } }
      }
    }
    validate = env.compile(schema)

    _ = validate({ a: 'a42' })
    t.equal(_.isFailure, true)

    _ = validate({ a: 55 })
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('anyOf', function (t) {
    let schema, validate, _

    schema = {
      anyOf: [
        { type: 'string' },
        { type: 'boolean' }
      ]
    }
    validate = env.compile(schema)

    t.plan(4)

    _ = validate('a42')
    t.equal(_.isSuccess, true)

    _ = validate(true)
    t.equal(_.isSuccess, true)

    _ = validate(1.0)
    t.equal(_.isSuccess, false)

    _ = validate(null)
    t.equal(_.isSuccess, false)

    t.end()
  })

  context.test('allOf', function (t) {
    let schema, validate, _

    schema = {
      allOf: [
        { type: 'integer', minimum: 1 },
        { type: 'integer', maximum: 1 }
      ]
    }
    validate = env.compile(schema)

    t.plan(3)

    _ = validate(1)
    t.equal(_.isSuccess, true)

    _ = validate(0)
    t.equal(_.isSuccess, false)

    _ = validate(2)
    t.equal(_.isSuccess, false)

    t.end()
  })

  context.test('oneOf', function (t) {
    let schema, validate, _

    schema = {
      oneOf: [
        { type: 'integer', minimum: 2 },
        { type: 'integer', minimum: 4 }
      ]
    }
    validate = env.compile(schema)

    t.plan(3)

    _ = validate(3)
    t.equal(_.isSuccess, true)

    _ = validate(4)
    t.equal(_.isSuccess, false)

    _ = validate(0)
    t.equal(_.isSuccess, false)

    t.end()
  })
})
