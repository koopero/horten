
const assert = require('chai').assert

describe('wrap', () => {
  const wrap = require('../src/wrap')

  it('no path', function () {
    assert.deepEqual( wrap( 'bar'), 'bar')
  })

  it('path in args', function () {
    assert.deepEqual( wrap( 'bar', 'foo' ), { foo: 'bar' } )
    assert.deepEqual( wrap( 'bar', 'foo/baz' ), { foo: { baz: 'bar'} } )

  })
})
