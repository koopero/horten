var test = require('./_test')
    , assert = test.assert

describe('set', function () {
  var set = require('../src/set')
  it('it will not smoke', function () {
    var mod = require('../index')
    assert.isFunction( set )
    assert.isFunction( mod.set )
  })

  it('will convert a primitive to an object', function() {
    var data = 'baz'
        , result = set( 'foo', data, 'foo' )

    assert.deepEqual( result, { foo: data } )
  })

  it('will share structure', function() {
    var data = { bar: 'baz' }
        , result = set( 'foo', data, 'foo' )

    assert.equal( result.foo, data )
  })


})
