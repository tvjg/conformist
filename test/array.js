const test = require('tape-catch')
const env = require('../index.js')()
const pp = require('util').inspect

test('array-specific validations', function (context) {
  const itemsWithSingleSchema = { 'items': { type: 'integer' } }

  context.test(pp(itemsWithSingleSchema), function (t) {
    let validate, instance, _
    validate = env.compile(itemsWithSingleSchema)

    t.plan(6)

    instance = null
    _ = validate(instance)
    t.ok(_.isSuccess, 'should succeed for ' + pp(instance))

    instance = 2
    _ = validate(instance)
    t.ok(_.isSuccess, 'should succeed for ' + pp(instance))

    instance = [1, 2, 3]
    _ = validate(instance)
    t.ok(_.isSuccess, 'should succeed for ' + pp(instance))

    instance = []
    _ = validate(instance)
    t.ok(_.isSuccess, 'should succeed for ' + pp(instance))

    instance = ['string']
    _ = validate(instance)
    t.notOk(_.isSuccess, 'should fail for ' + pp(instance))

    instance = [2, false]
    _ = validate(instance)
    t.notOk(_.isSuccess, 'should fail for ' + pp(instance))

    t.end()
  })

  const itemsWithMultipleSchema = { 'items': [{ type: 'integer' }, {}] }

  context.test(pp(itemsWithMultipleSchema), function (t) {
    let validate, instance, _
    validate = env.compile(itemsWithMultipleSchema)

    t.plan(7)

    instance = null
    _ = validate(instance)
    t.ok(_.isSuccess, 'should succeed for ' + pp(instance))

    instance = [1, 2, 3]
    _ = validate(instance)
    t.ok(_.isSuccess, 'should succeed for ' + pp(instance))

    instance = [1, false]
    _ = validate(instance)
    t.ok(_.isSuccess, 'should succeed for ' + pp(instance))

    instance = ['string']
    _ = validate(instance)
    t.notOk(_.isSuccess, 'should fail for ' + pp(instance))

    instance = [2.1, 2]
    _ = validate(instance)
    t.notOk(_.isSuccess, 'should fail for ' + pp(instance))

    instance = [1]
    _ = validate(instance)
    t.ok(_.isSuccess, 'should succeed for ' + pp(instance))

    instance = []
    _ = validate([])
    t.notOk(_.isSuccess, 'should fail for ' + pp(instance))

    t.end()
  })

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
