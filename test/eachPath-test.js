const test = require('./_test')
    , assert = test.assert

describe('eachPath', function () {
  const eachPath = require('../src/eachPath')
  it('will do nothing', function () {
    eachPath()
    eachPath( { foo: 'bar' } )
  })

  it('will return paths', function () {
    const data = { foo: { bar: 42 } }
        , result = eachPath( data )

    assert.deepEqual( result, [['foo','bar']] )
  })

  it('will call callback', function () {
    const data = { foo: { bar: 42 } }

    var calls = 0

    eachPath( data, function ( value, path ) {
      assert.deepEqual( path, ['foo', 'bar'] )
      assert.equal( value, 42 )

      calls++
    } )

    assert.equal( calls, 1 )
  })

  xit('will not do anything to primitives', function () {
    eachPath( new Buffer('foo'), assert.fail )
    eachPath( true, assert.fail )
    eachPath( false, assert.fail )
    eachPath( 42, assert.fail )
    eachPath( undefined, assert.fail )
    eachPath( 'foo', assert.fail )
    eachPath( null, assert.fail )
  })
})
