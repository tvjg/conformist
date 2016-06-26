const R = require('ramda')
const {Validation} = require('folktale/data')

const {Failure} = Validation

const collectArgs = (...args) => args
const isSuccess = R.prop('isSuccess')
const orFail = (keyword) => (v) => v || Failure([{ [keyword]: null }])

const findSuccess = R.find(isSuccess)
const filterSuccess = R.filter(isSuccess)
const allSucceed = R.all(isSuccess)

const oneSuccess = R.compose(R.equals(1), R.length, filterSuccess)
const exactlyOneMustSucceed = R.cond([[oneSuccess, R.head]])
const allMustSucceed = R.cond([[allSucceed, R.head]])

module.exports = {
  'anyOf': R.converge(R.pipe(collectArgs, findSuccess, orFail('anyOf'))),
  'oneOf': R.converge(R.pipe(collectArgs, exactlyOneMustSucceed, orFail('oneOf'))),
  'allOf': R.converge(R.pipe(collectArgs, allMustSucceed, orFail('allOf')))
}
