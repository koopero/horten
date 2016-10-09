const test = require('./_test')
    , assert = test.assert

describe('DeEcho', function () {
  const DeEcho = require('../src/DeEcho')
  it("doesn't smoke", function () {
    assert.isFunction( DeEcho )
    const deecho = DeEcho()
    assert.instanceOf( deecho, DeEcho )
    assert.isFunction( deecho.send )
    assert.isFunction( deecho.receive )
  })

  it('will work', function () {
    const deecho = DeEcho()
    var data = { foo: 'bar' }
    deecho.send( data )

    var result = deecho.receive( data )

    assert.deepEqual( {}, result )
  })

  describe('receive', function () {
    it('will pass data unmolested', function () {
      const deecho = DeEcho()
      var data = { foo: 'bar' }
      var result = deecho.receive( data )

      assert.equal( data, result )

      data = 42
      result = deecho.receive( data )

      assert.equal( data, result )
    })
  })
})
