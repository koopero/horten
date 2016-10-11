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
    var data = { foo: 'bar' }
    echo.send( data )

    var result = echo.receive( data )

    assert.deepEqual( {}, result )
  })

  describe('receive', function () {
    it('will pass data unmolested', function () {
      const echo = Echo()
      var data = { foo: 'bar' }
      var result = echo.receive( data )

      assert.equal( result, data )
    })
  })
})
