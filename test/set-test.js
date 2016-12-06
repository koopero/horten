const test = require('./_test')
    , assert = test.assert

describe('set', function () {
  const set = require('../src/set')
  it('it will not smoke', function () {
    const mod = require('../index')
    assert.isFunction( set )
    assert.isFunction( mod.set )
  })

  it('will convert a primitive to an object', function() {
    const data = 'baz'
        , result = set( 'foo', data, 'foo' )

    assert.deepEqual( result, { foo: data } )
  })

  it('will share structure', function() {
    const data = { bar: 'baz' }
        , result = set( 'foo', data, 'foo' )

    assert.equal( result.foo, data )
  })


})
