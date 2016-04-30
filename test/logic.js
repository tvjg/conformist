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
})
