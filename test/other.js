const test = require('tape-catch')
const env = require('../index.js')()

test('other validations', function (context) {
  context.test('enum', function (t) {
    let schema, validate, _

    schema = { 'enum': [2, null] }
    validate = env.compile(schema)

    t.plan(4)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    _ = validate(2)
    t.equal(_.isSuccess, true)

    _ = validate('affable')
    t.equal(_.isSuccess, false)

    _ = validate(0)
    t.equal(_.isSuccess, false)

    t.end()
  })

  context.test('minProperties', function (t) {
    let schema, validate, _

    schema = { 'minProperties': 2 }
    validate = env.compile(schema)

    t.plan(4)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    _ = validate({ a: 0, b: 0 })
    t.equal(_.isSuccess, true)

    _ = validate({ a: 0, b: 0, c: 0 })
    t.equal(_.isSuccess, true)

    _ = validate({})
    t.equal(_.isSuccess, false)

    t.end()
  })

  context.test('maxProperties', function (t) {
    let schema, validate, _

    schema = { 'maxProperties': 2 }
    validate = env.compile(schema)

    t.plan(4)

    _ = validate(true)
    t.equal(_.isSuccess, true)

    _ = validate({})
    t.equal(_.isSuccess, true)

    _ = validate({ a: 0, b: 0 })
    t.equal(_.isSuccess, true)

    _ = validate({ a: 0, b: 0, c: 0 })
    t.equal(_.isSuccess, false)

    t.end()
  })
})
