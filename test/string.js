const test = require('tape-catch')
const env = require('../index.js')()

test('string-specific validations', function (context) {
  context.test('minLength', function (t) {
    let schema, validate, _

    schema = { 'minLength': 1 }
    validate = env.compile(schema)

    t.plan(3)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    _ = validate('')
    t.equal(_.isFailure, true)

    _ = validate('affable')
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('maxLength', function (t) {
    let schema, validate, _

    schema = { 'maxLength': 2 }
    validate = env.compile(schema)

    t.plan(3)

    _ = validate(null)
    t.equal(_.isSuccess, true)

    _ = validate('')
    t.equal(_.isSuccess, true)

    _ = validate('malicious')
    t.equal(_.isFailure, true)

    t.end()
  })

  context.test('pattern', function (t) {
    let schema, validate, _

    schema = { type: 'string', pattern: 'ale$' }
    validate = env.compile(schema)

    t.plan(2)

    _ = validate('fail')
    t.equal(_.isFailure, true)

    _ = validate('ale')
    t.equal(_.isSuccess, true)

    t.end()
  })
})
