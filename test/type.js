const test = require('tape-catch')
const env = require('../index.js')()

const userSchema = {
  type: 'object',
  properties: {
    firstname: { 'type': 'string' },
    lastname: { 'type': 'string' },
    address: {
      type: 'object',
      properties: {
        city: { type: 'string' }
      }
    }
  },
  additionalProperties: false,
  required: ['firstname', 'lastname']
}

const user = {
  firstname: 'first',
  lastname: 'last',
  address: { 'city': 'des moines' }
}

test('types', function (context) {
  context.test('string', function (t) {
    let schema, validate, _

    schema = { 'type': 'string' }
    validate = env.compile(schema)

    t.plan(2)

    _ = validate(null)
    t.equal(_.isFailure, true)

    _ = validate('')
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('number', function (t) {
    let schema, validate, _

    schema = { 'type': 'number' }
    validate = env.compile(schema)

    t.plan(4)

    _ = validate(null)
    t.equal(_.isFailure, true)

    _ = validate([])
    t.equal(_.isFailure, true)

    _ = validate(1)
    t.equal(_.isSuccess, true)

    _ = validate(Math.PI)
    t.equal(_.isSuccess, true)

    t.end()
  })

  context.test('object', function (t) {
    let validate, _

    validate = env.compile(userSchema)

    t.plan(3)

    _ = validate({ x: false })
    t.equal(_.isFailure, true)

    _ = validate(user)
    t.equal(_.isSuccess, true)

    // FIXME: Restore with dissoc
    delete user.firstname

    _ = validate(user)
    t.equal(_.isFailure, true)

    t.end()
  })
})
