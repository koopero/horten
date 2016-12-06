const test = require('./_test')
    , assert = test.assert

describe('unset', function () {
  const unset = require('../src/unset')
  it('it will not smoke', function () {
    const mod = require('../index')
    assert.isFunction( unset )
    assert.isFunction( mod.unset )
  })

  it('will "delete" primitives', function () {
    assert.isUndefined( unset('foo') )
  })

  it('will unset a key', function() {
    const data = { foo: 'bar', bar: 'baz' }
        , result = unset( data, [['foo']] )

    assert.deepEqual( result, { bar: 'baz' } )
    assert.notEqual( result, data )
  })

  it('will pass object unchanged when path does not exist', function () {
    const data = { foo: 'bar' }
        , result = unset( data, 'baz/' )

    assert.deepEqual( result, { foo: 'bar' } )
    assert.equal( result, data )
  })
})
