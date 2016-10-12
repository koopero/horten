const test = require('./_test')
    , assert = test.assert
    , assertPathEqual = test.assertPathEqual

describe('Mutant events', function() {
  const Mutant = require('../src/Mutant')

  describe('change', function () {
    it('is called on change', function () {
      const mutant = Mutant()
          , data = 42

      var calls = 0

      mutant.on('change', function () {
        calls ++
      })

      mutant.set( data )

      assert.equal( calls, 1 )
    })
  })

  describe('value', function () {
    it('is called on change', function () {
      const mutant = Mutant()
          , data = 42

      var calls = 0

      mutant.on('value', function ( value ) {
        assert.deepEqual( value, data )
        calls ++
      })

      mutant.set( data )

      assert.equal( calls, 1 )
    })

    describe('submutants', function () {
      it('is called on change', function () {
        const mutant = Mutant()
            , data = 42
            , path = 'foo/bar'

        var calls = 0

        mutant.walk( path ).on('value', function ( value ) {
          assertPathEqual( this.path, path )
          assert.deepEqual( value, data )
          calls ++
        })

        mutant.set( data, path )

        assert.equal( calls, 1 )
      })
    })
  })


})
