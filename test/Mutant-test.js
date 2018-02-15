const test = require('./_test')
    , assert = test.assert

describe('Mutant', function() {
  const Mutant = require('../src/Mutant')

  describe('.isMutant', function () {
    const isMutant = Mutant.isMutant
    it('works', function () {
      const mutant = Mutant()
      assert.equal( isMutant( mutant ), true )
      assert.equal( isMutant( null ), false )
      assert.equal( isMutant( {} ), false )
      assert.equal( isMutant( [] ), false )

    })
  })

  it('is an EventEmitter', function () {
    const mutant = Mutant()
    assert.isFunction( mutant.on )
    assert.isFunction( mutant.emit )
  })

  describe('initialize', function () {
    it('new', () => {
      const foo = new Mutant()
      foo.get()
    })

    it('function', () => {
      const foo = Mutant()
      foo.get()
    })

    it('from Mutant', () => {
      const ref = { foo: 'bar' }
          , a = Mutant( ref )
          , b = Mutant( a )
          , r = b.get()

      assert.equal( r, ref )
    })
  })

  describe('public properties', () => {
    it('path', () => {
      const root = new Mutant()
      assert.deepEqual( root.path, [] )
      assert( root.hasOwnProperty('path') )
    })

    it('value', () => {
      const data = test.data()
          , root = new Mutant( data )

      assert( root.hasOwnProperty('value') )
      assert.equal( root.value, data )
    })
  })

  it('pass a reference', function () {
    const ref = {}
        , mutant = new Mutant( ref )
        , result = mutant.get()

    assert.equal( result, ref )
  })

  describe('.get', function () {
    it('will walk paths', function () {
      const mutant = new Mutant( { foo: 'bar' } )
      assert.equal( mutant.get('foo'), 'bar' )
    })

    it('result is never mutated', function () {
      const data = { foo: 'bar' }
          , mutant = Mutant( data )

      assert.equal( mutant.get(), data )
      mutant.set( 'baz', 'foo' )
      const result = mutant.get()
      assert.notEqual( result, data )
      assert.deepEqual( result, { foo: 'baz'} )

      mutant.set( 'bop', 'foo' )
      assert.deepEqual( result, { foo: 'baz'} )
      const nextResult = mutant.get()
      assert.notEqual( nextResult, result )
      assert.deepEqual( nextResult, { foo: 'bop'} )
    })
  })

  describe('.map', function () {
    it('will do nothing', function () {
      const mutant = new Mutant( { foo: 'bar' } )
      mutant.map()
      assert.equal( mutant.get('foo'), 'bar' )
    })

    it('will do something', function () {
      const mutant = new Mutant( { foo: 'bar' } )
      mutant.map( function( mutant, path ) {
        assert.equal( mutant.get(), 'bar' )
        assert.equal( path, 'foo' )
        mutant.set( 42 )
      } )
      assert.equal( mutant.get('foo'), 42 )
    })
  })

  describe('.unset', function () {
    it('will delete root', function () {
      const mutant = new Mutant( { foo: 'bar' } )
      mutant.unset()
      assert.equal( mutant.get(), undefined )
    })

    it('will delete key', function () {
      const init = { foo: 'bar', bar: 'baz' }
          , mutant = new Mutant( init )
      mutant.unset('foo')
      const result = mutant.get()
      assert.deepEqual( result, { bar: 'baz' } )
      assert.notEqual( result, init )
    })

    it('will delete object', function () {
      const init = { foo: 'bar', bar: 'baz' }
          , mutant = new Mutant( init )

      mutant.unset()
      const result = mutant.get()
      assert.equal( result, undefined )
    })

    it('will delete objects with dirty submutants', function () {
      const init = { foo: 'bar', bar: 'baz' }
          , mutant = new Mutant( init )

      // Walk will ensure subs are created
      mutant.walk('foo').patch( 3 )
      mutant.walk('bar')

      mutant.unset()
      assert.equal( mutant.get(), undefined )
      mutant.walk('foo').patch( 2 )
      assert.deepEqual( mutant.get(), { foo: 2 } )
    })
  })

  describe('.patch', function() {
    it('will do nothing', function () {
      const ref = { foo: 42 }
          , mutant = new Mutant( ref )

      mutant.patch()
      assert.equal( mutant.get(), ref )
    })


    it('will merge objects', function () {
      const mutant = new Mutant()
      mutant.patch( { foo: 123 } )
      mutant.patch( { bar: 456 } )
      assert.deepEqual( mutant.get(), { foo: 123, bar: 456 } )
    })

    describe( 'will return delta', function () {
      it('for primitives', function () {
        const mutant = new Mutant( 42 )
            , delta = mutant.patch( 123 )

        assert.deepEqual( delta, 123 )
      })

      it('undefined for unchanged primitives', function () {
        const mutant = new Mutant( 42 )
            , delta = mutant.patch( 42 )

        assert.deepEqual( delta, undefined )
      })

      it('for objects', function () {
        const mutant = new Mutant( { foo: 42 } )
            , delta = mutant.patch( { foo: 123 } )

        assert.deepEqual( delta, { foo: 123 } )
      })

      it('for paths', function () {
        const mutant = new Mutant( { foo: 42 } )
            , delta = mutant.patch( 123, 'foo' )

        assert.deepEqual( delta, { foo: 123 } )
      })
    })

    describe('will emit delta', function () {
      it('for object changes', ( cb ) => {
        const mutant = Mutant( { foo: 42 } )
        var calls = 0
        mutant.on('delta', function ( delta ) {
          assert.deepEqual( delta, { bar: 123 } )
          calls++
        } )

        mutant.patch( { foo: 42, bar: 123 } )

        setTimeout( () => {
          assert.equal( calls, 1 )
          cb()
        }, 50 )

      })
    })


    it('will merge initial with object', function () {
      const mutant = new Mutant( { foo: 123 } )
      mutant.patch( { bar: 456 } )
      assert.deepEqual( mutant.get(), { foo: 123, bar: 456 } )
    })

    it('path', function () {
      const mutant = new Mutant()

      mutant.patch( 42, 'foo/bar' )
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 42 } } )
    })

    it('will merge paths complex', function () {
      const ref =
              { rand:
                Math.random()
              }
          , mutant = new Mutant( { baz: ref } )
          , value = Math.random()
          , expect = {
            foo: { bar: value },
            baz: ref
          }

      mutant.patch( value, 'foo/bar' )

      const result = mutant.get()
      assert.deepEqual( result, expect )
    })
  })

  describe('.set', function() {
    it('will not smoke', function () {
      const mutant = new Mutant()
      assert.isFunction( mutant.set )
      mutant.set()
    })

    it('will set the value', function () {
      const mutant = new Mutant()
      const value = 'foo'
      const result = mutant.set( value )
      // assert.equal( result, true )
      assert.equal( mutant.get(), value )
    })

    it('will set a key', function () {
      const mutant = new Mutant()
          , key = 'foo'
          , value = 'bar'
          , expect = {}

      expect[ key ] = value

      const result = mutant.set( value, key )
      assert.deepEqual( mutant.get(), expect )

    })

    it('will NOT set a key', function () {
      const key = 'foo'
          , value = 42
          , object = { foo: value }
          , mutant = new Mutant( object )

      const result = mutant.set( value, key )
      assert.equal( result, false )
      assert.equal( mutant.get(), object )
    })

    it('will set a path', function () {
      const object = { foo: { bar: 430 } }
          , mutant = new Mutant( object )

      const setResult = mutant.set( 42, 'foo', 'bar' )
      const result = mutant.get()

      assert.deepEqual( result, { foo: { bar: 42 } } )
      assert.notStrictEqual( result, object )
    })

    it('will NOT set a path', function () {
      const value = 42
          , object = { foo: { bar: value } }
          , mutant = new Mutant( object )

      const result = mutant.set( value, 'foo', 'bar' )
      assert.equal( mutant.get(), object )
    })

    it('will leave siblings unaltered', function () {
      const value = 42
          , ref = {}
          , object = { foo: { bar: Math.random() }, baz: ref }
          , mutant = new Mutant( object )

      const setResult = mutant.set( Math.random(), 'foo', 'bar' )

      const result = mutant.get()
      assert.equal( mutant.get().baz, ref )
    })
  })

  describe('walk + set', function () {
    it('will set', function () {
      const mutant = new Mutant()
      mutant.walk('foo/bar').set( 'baz' )
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 'baz' } } )
    })

    it('will merge', function () {
      const mutant = new Mutant( { foo: 42 } )
      mutant.walk('bar').set( 'baz' )
      const result = mutant.get()
      assert.deepEqual( result, { foo: 42, bar: 'baz' } )
    })

    it('will patch', function () {
      const mutant = new Mutant( { foo: { bar: { baz: 42 } } } )
      mutant.walk('foo/bar').patch( { bop: 123 } )
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: { baz: 42, bop: 123 } } } )
    })

    it('will patch 2', function () {
      const mutant = new Mutant( { foo: { bar: { baz: 42 } } } )
      mutant.walk('foo').patch( { bop: 123 }, 'bar' )
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: { baz: 42, bop: 123 } } } )
    })
  })

  describe('walk + map', function () {
    it('will set inner key', function () {
      const mutant = new Mutant( { foo: { bar: 123, baz: 42 } } )
      mutant.walk('foo').map( function ( sub, key ) {
        if ( key == 'bar' )
          sub.set( new Mutant( 456 ) )
        else
          return sub
      })
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 456, baz: 42 } } )
    })

    it('will set inner key 2 ', function () {
      const mutant = new Mutant( { foo: { bar: 123, baz: 42 } } )
      mutant.walk('foo').map( function ( sub, key ) {
        if ( key == 'bar' )
          // sub.set( 456 )
          return 456
      })
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 456, baz: 42 } } )
    })
  })

  describe('eachPath', function () {
    it('is a function', function () {
      const mutant = new Mutant()
      assert.isFunction( mutant.eachPath )
    })

    it('will call callback', function () {
      const data = { foo: { bar: 42 } }
          , mutant = new Mutant( data )

      var calls = 0

      mutant.eachPath( function ( value, path ) {
        assert.deepEqual( path, ['foo', 'bar'] )
        assert.equal( value, 42 )

        calls++
      } )

      assert.equal( calls, 1 )
    })
  })

  describe('.keys()', () => {
    it('works for objects', () => {
      const data = { foo: { bar: 42 } }
      const mutant = new Mutant( data )

      assert.deepEqual( mutant.keys(), ['foo'] )
    })
  } )
})
