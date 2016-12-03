var assert = require('chai').assert

describe('pairs', function () {
  var pairs = require('../src/pairs')
  it('will work', function () {
    var ob = {
        foo: {
          bar: 'baz'
        }
      },
      res = [ ['foo/bar/', 'baz'] ]

    assert.deepEqual( pairs(ob), res )
  })

  it('arrays', function () {
    var ob = ['foo']
        , res = [ ['0/', 'foo'] ]

    assert.deepEqual( pairs(ob), res )
  })
})
