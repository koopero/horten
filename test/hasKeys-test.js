var test = require('./_test')
    , assert = test.assert

describe('hasKeys', function () {
  var hasKeys = require('../src/hasKeys')
  describe('no keys', function () {
    it('primitives', function () {
      assert.equal( hasKeys( 'string' ), false )
    })
  })

  describe('keys', function () {
    it('object', function () {
      assert.equal( hasKeys( {} ), true )
    })

    it('array', function () {
      assert.equal( hasKeys( [] ), true )
    })
  })

  describe('objects ignored', function () {
    it('Buffer', function () {
      assert.equal( hasKeys( new Buffer('foo') ), false )
    })
  })
})
