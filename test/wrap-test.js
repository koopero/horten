const assert = require('chai').assert

describe('wrap', () => {
  const wrap = require('../src/wrap')

  it('no path', () => {
    assert.deepEqual( wrap( 'bar'), 'bar')
  })

  it('path in args', () => {
    assert.deepEqual( wrap( 'bar', 'foo' ), { foo: 'bar' } )
    assert.deepEqual( wrap( 'bar', 'foo/baz' ), { foo: { baz: 'bar'} } )
  })
})
