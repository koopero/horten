const test = require('./_test')
    , assert = test.assert
    , assertPathEqual = test.assertPathEqual

describe('Mutant::mutate', function() {
  const Mutant = require('../src/Mutant')
      , NS = require('../src/namespace')
      , mutate = NS.mutate

  describe('patch', function () {
    it("doesn't smoke", function () {
      const mutant = Mutant()
          , data = { foo: 'bar'}

      const result = mutant[ mutate ]( data, [], { needDelta: true } )

      assert( result )
      assert( result.delta )
      assert.deepEqual( result.delta, data )

    })
  })
})
