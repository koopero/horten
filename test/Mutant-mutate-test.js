var test = require('./_test')
    , assert = test.assert
    , assertPathEqual = test.assertPathEqual

describe('Mutant::mutate', function() {
  var Mutant = require('../src/Mutant')
      , NS = require('../src/namespace')
      , mutate = NS.mutate

  describe('patch', function () {
    it("doesn't smoke", function () {
      var mutant = Mutant()
          , data = { foo: 'bar'}

      var result = mutant[ mutate ]( data, [], { needDelta: true } )

      console.log( 'result', result )

      assert( result )
      assert( result.delta )
      assert.deepEqual( result.delta, data )

    })
  })
})
