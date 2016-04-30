const test = require('tape-catch')
const env = require('../index.js')()

test('format', function (context) {
  context.test('alpha', function (t) {
    let schema, validate, _

    schema = { type: 'string', format: 'alpha' }
    validate = env.compile(schema)

    t.plan(2)

    _ = validate('a42')
    t.equal(_.isFailure, true)

    _ = validate('undisclosed')
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('numeric', function (t) {
    let schema, validate, _

    schema = { type: 'string', format: 'numeric' }
    validate = env.compile(schema)

    t.plan(2)

    _ = validate('a42')
    t.equal(_.isFailure, true)

    _ = validate('42')
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('alphanumeric', function (t) {
    let schema, validate, _

    schema = { type: 'string', format: 'alphanumeric' }
    validate = env.compile(schema)

    t.plan(2)

    _ = validate('test%-')
    t.equal(_.isFailure, true)

    _ = validate('a42')
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('hexadecimal', function (t) {
    let schema, validate, _

    schema = { type: 'string', format: 'hexadecimal' }
    validate = env.compile(schema)

    t.plan(2)

    _ = validate('x44')
    t.equal(_.isFailure, true)

    _ = validate('deadbeef')
    t.equal(_.isSuccess, true)

    t.end()
  })
})
