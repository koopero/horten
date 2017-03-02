const test = require('./_test')
    , assert = test.assert

describe('Echo', function () {
  const Echo = require('../src/Echo')
  it("doesn't smoke", function () {
    const _module = require('../index')
    assert.isFunction( _module.Echo )
    assert.isFunction( Echo )
    const echo = Echo()

    assert.instanceOf( echo, Echo )
    assert.isFunction( echo.send )
    assert.isFunction( echo.receive )
  })

  it('will work', function () {
    const echo = Echo()
    const data = { foo: 'bar' }
    echo.send( data )

    const result = echo.receive( data )

    assert.deepEqual( result, undefined )
  })

  describe('receive', function () {
    it('will pass data unmolested', function () {
      const echo = Echo()
      const data = { foo: 'bar' }
      const result = echo.receive( data )

      assert.equal( result, data )
    })
  })

  describe('more real world', () => {
    it('will do some real shit', () => {
      const echo = new Echo()

      echo.send( {
        foo: {
          bar: 'baz'
        }
      })

      let result = echo.receive( {
        foo: {
          bar: 'baz',
          bop: 'fuzz'
        },
        baz: 'fux'
      })

      assert.deepEqual( result, { foo: { bop: 'fuzz' }, baz: 'fux' } )

      result = echo.receive( {
        foo: {
          bar: 'baz',
          bop: 'fuzz'
        },
        baz: 'fux'
      })

      assert.deepEqual( result, { foo: { bar: 'baz', bop: 'fuzz' }, baz: 'fux' } )

    })
  })

})
