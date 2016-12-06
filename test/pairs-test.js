const assert = require('chai').assert

describe('pairs', function () {
  const pairs = require('../src/pairs')
  it('will work', function () {
    const ob = {
        foo: {
          bar: 'baz'
        }
      },
      res = [ ['foo/bar/', 'baz'] ]

    assert.deepEqual( pairs(ob), res )
  })

  it('arrays', function () {
    const ob = ['foo']
        , res = [ ['0/', 'foo'] ]

    assert.deepEqual( pairs(ob), res )
  })
})
