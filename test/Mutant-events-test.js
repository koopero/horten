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

  describe('keys', () => {
    it('is called on initialize', ( done ) => {
      const mutant = Mutant()
          , data = { foo: 'bar' }

      var calls = 0

      mutant.on('keys', function () {
        done()
      })

      mutant.set( data )
    })

    it('is called from sub set', done => {
      const mutant = Mutant()
      const sub = mutant.walk('foo')

      mutant.on('keys', ( keys ) => {
        assert.deepEqual( keys, ['foo'] )
        done()
      } )

      sub.set('bar')
    } )

    it('is called from unset', done => {
      const mutant = Mutant( { foo: 'bar'} )

      assert.deepEqual( mutant.keys(), ['foo'] )

      mutant.on('keys', ( keys ) => {
        assert.deepEqual( keys, [] )
        done()
      } )

      mutant.unset('foo')
    } )

    it('is called from set', done => {
      const mutant = Mutant( { foo: 'bar' } )

      // assert.deepEqual( mutant.keys(), ['foo'] )

      mutant.on('keys', ( keys ) => {
        assert.deepEqual( keys, ['bar'] )
        done()
      } )

      mutant.set({bar:'foo'})
    } )

    it('is called from patch', done => {
      const mutant = Mutant( { foo: 'bar' } )

      mutant.on('keys', ( keys ) => {
        assert.deepEqual( keys, ['bar','foo'] )
        done()
      } )

      mutant.patch({bar:'foo'})
    } )
  })

})
