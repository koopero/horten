var test = require('./_test')
    , assert = test.assert

describe('eachPath', function () {
  var eachPath = require('../src/eachPath')
  it('will do nothing', function () {
    eachPath()
    eachPath( { foo: 'bar' } )
  })

  it('will return paths', function () {
    var data = { foo: { bar: 42 } }
        , result = eachPath( data )

    assert.deepEqual( result, [['foo','bar']] )
  })

  it('will call callback', function () {
    var data = { foo: { bar: 42 } }

    var calls = 0

    eachPath( data, function ( value, path ) {
      assert.deepEqual( path, ['foo', 'bar'] )
      assert.equal( value, 42 )
      calls++
    } )

    assert.equal( calls, 1 )
  })

  it('will call callback once for primitives', function () {
    var data = 42

    var calls = 0

    eachPath( data, function ( value, path ) {
      assert.deepEqual( path, [] )
      assert.equal( value, data )
      calls++
    } )

    assert.equal( calls, 1 )
  })
})
