var test = require('./_test')
    , assert = test.assert

describe('Mutant', function() {
  var Mutant = require('../src/Mutant')

  describe('.isMutant', function () {
    var isMutant = Mutant.isMutant
    it('works', function () {
      var mutant = Mutant()
      assert.equal( isMutant( mutant ), true )
      assert.equal( isMutant( null ), false )
      assert.equal( isMutant( {} ), false )
      assert.equal( isMutant( [] ), false )

    })
  })

  it('is an EventEmitter', function () {
    var mutant = Mutant()
    assert.isFunction( mutant.on )
    assert.isFunction( mutant.emit )
  })

  describe('initialize', function () {
    it('new', function () {
      var foo = new Mutant()
      foo.result()
    })

    it('function', function () {
      var foo = Mutant()
      foo.result()
    })

    it('from Mutant', function () {
      var ref = { foo: 'bar' }
          , a = Mutant( ref )
          , b = Mutant( a )
          , r = b.get()

      assert.equal( r, ref )
    })
  })

  it('pass a reference', function () {
    var ref = {}
        , mutant = new Mutant( ref )
        , result = mutant.result()

    assert.equal( result, ref )
  })


  describe('.isDirty', function() {
    it('will not smoke', function () {
      var mutant = new Mutant()
      assert.isFunction( mutant.isDirty )
      assert.isBoolean( mutant.isDirty() )
    })
  })

  describe('.get', function () {
    it('will walk paths', function () {
      var mutant = new Mutant( { foo: 'bar' } )
      assert.equal( mutant.get('foo'), 'bar' )
    })

    it('result is never mutated', function () {
      var data = { foo: 'bar' }
          , mutant = Mutant( data )

      assert.equal( mutant.get(), data )
      mutant.set( 'baz', 'foo' )
      var result = mutant.get()
      assert.notEqual( result, data )
      assert.deepEqual( result, { foo: 'baz'} )

      mutant.set( 'bop', 'foo' )
      assert.deepEqual( result, { foo: 'baz'} )
      var nextResult = mutant.get()
      assert.notEqual( nextResult, result )
      assert.deepEqual( nextResult, { foo: 'bop'} )
    })
  })

  describe('.map', function () {
    it('will do nothing', function () {
      var mutant = new Mutant( { foo: 'bar' } )
      mutant.map()
      assert.equal( mutant.get('foo'), 'bar' )
    })

    it('will do something', function () {
      var mutant = new Mutant( { foo: 'bar' } )
      mutant.map( function( mutant, path ) {
        assert.equal( mutant.get(), 'bar' )
        assert.equal( path, 'foo' )
        mutant.set( 42 )
      } )
      assert.equal( mutant.get('foo'), 42 )
    })
  })

  describe('.del', function () {
    it('will delete root', function () {
      var mutant = new Mutant( { foo: 'bar' } )
      mutant.del()
      assert.equal( mutant.get(), undefined )
    })

    it('will delete key', function () {
      var init = { foo: 'bar', bar: 'baz' }
          , mutant = new Mutant( init )
      mutant.del('foo')
      var result = mutant.get()
      assert.deepEqual( result, { bar: 'baz' } )
      assert.notEqual( result, init )
    })

    it('will delete object', function () {
      var init = { foo: 'bar', bar: 'baz' }
          , mutant = new Mutant( init )

      mutant.del()
      var result = mutant.get()
      assert.equal( result, undefined )
    })

    it('will delete objects with dirty submutants', function () {
      var init = { foo: 'bar', bar: 'baz' }
          , mutant = new Mutant( init )

      // Walk will ensure subs are created
      mutant.walk('foo').patch( 3 )
      mutant.walk('bar')

      mutant.del()
      assert.equal( mutant.get(), undefined )
      mutant.walk('foo').patch( 2 )
      assert.deepEqual( mutant.get(), { foo: 2 } )
    })
  })

  describe('.patch', function() {
    it('will do nothing', function () {
      var ref = { foo: 42 }
          , mutant = new Mutant( ref )

      mutant.patch()
      assert.equal( mutant.isDirty(), false )
      assert.equal( mutant.result(),  ref )
    })


    it('will merge objects', function () {
      var mutant = new Mutant()
      mutant.patch( { foo: 123 } )
      mutant.patch( { bar: 456 } )
      assert.deepEqual( mutant.result(), { foo: 123, bar: 456 } )
    })

    describe( 'will return delta', function () {
      it('for primitives', function () {
        var mutant = new Mutant( 42 )
            , delta = mutant.patch( 123 )

        assert.deepEqual( delta, 123 )
      })

      it('undefined for unchanged primitives', function () {
        var mutant = new Mutant( 42 )
            , delta = mutant.patch( 42 )

        assert.deepEqual( delta, undefined )
      })

      it('for objects', function () {
        var mutant = new Mutant( { foo: 42 } )
            , delta = mutant.patch( { foo: 123 } )

        assert.deepEqual( delta, { foo: 123 } )
      })

      it('for paths', function () {
        var mutant = new Mutant( { foo: 42 } )
            , delta = mutant.patch( 123, 'foo' )

        assert.deepEqual( delta, { foo: 123 } )
      })
    })

    describe('will emit delta', function () {
      it('for object changes', ( cb ) => {
        var mutant = Mutant( { foo: 42 } )
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
      var mutant = new Mutant( { foo: 123 } )
      mutant.patch( { bar: 456 } )
      assert.deepEqual( mutant.result(), { foo: 123, bar: 456 } )
    })

    it('path', function () {
      var mutant = new Mutant()

      mutant.patch( 42, 'foo/bar' )
      var result = mutant.result()
      assert.deepEqual( result, { foo: { bar: 42 } } )
    })

    it('will merge paths complex', function () {
      var ref =
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

      var result = mutant.result()
      assert.deepEqual( result, expect )
    })
  })

  describe('.set', function() {
    it('will not smoke', function () {
      var mutant = new Mutant()
      assert.isFunction( mutant.set )
      mutant.set()
    })

    it('will set the value', function () {
      var mutant = new Mutant()
      var value = 'foo'
      var result = mutant.set( value )
      // assert.equal( result, true )
      assert.equal( mutant.result(), value )
      assert( mutant.isDirty() )
    })

    it('will set a key', function () {
      var mutant = new Mutant()
          , key = 'foo'
          , value = 'bar'
          , expect = {}

      expect[ key ] = value

      var result = mutant.set( value, key )
      // assert.equal( result, true )
      // assert.equal( mutant.isDirty(), true )
      assert.deepEqual( mutant.result(), expect )

    })

    it('will NOT set a key', function () {
      var key = 'foo'
          , value = 42
          , object = { foo: value }
          , mutant = new Mutant( object )

      var result = mutant.set( value, key )
      assert.equal( result, false )
      assert.equal( mutant.isDirty(), false )
      assert.equal( mutant.result(), object )
    })

    it('will set a path', function () {
      var object = { foo: { bar: 430 } }
          , mutant = new Mutant( object )

      var setResult = mutant.set( 42, 'foo', 'bar' )
      // assert.equal( setResult, true )
      // assert.equal( mutant.isDirty(), true )

      var result = mutant.result()

      assert.deepEqual( result, { foo: { bar: 42 } } )
      assert.notStrictEqual( result, object )
    })

    it('will NOT set a path', function () {
      var value = 42
          , object = { foo: { bar: value } }
          , mutant = new Mutant( object )

      var result = mutant.set( value, 'foo', 'bar' )
      // assert.equal( result, false )
      // assert.equal( mutant.isDirty(), false )
      assert.equal( mutant.get(), object )
    })

    it('will leave siblings unaltered', function () {
      var value = 42
          , ref = {}
          , object = { foo: { bar: Math.random() }, baz: ref }
          , mutant = new Mutant( object )

      var setResult = mutant.set( Math.random(), 'foo', 'bar' )
      // assert.equal( setResult, true )
      // assert.equal( mutant.isDirty(), true )

      var result = mutant.result()
      assert.equal( mutant.result().baz, ref )
    })
  })

  describe('walk + set', function () {
    it('will set', function () {
      var mutant = new Mutant()
      mutant.walk('foo/bar').set( 'baz' )
      var result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 'baz' } } )
    })

    it('will merge', function () {
      var mutant = new Mutant( { foo: 42 } )
      mutant.walk('bar').set( 'baz' )
      var result = mutant.get()
      assert.deepEqual( result, { foo: 42, bar: 'baz' } )
    })

    it('will patch', function () {
      var mutant = new Mutant( { foo: { bar: { baz: 42 } } } )
      mutant.walk('foo/bar').patch( { bop: 123 } )
      var result = mutant.get()
      assert.deepEqual( result, { foo: { bar: { baz: 42, bop: 123 } } } )
    })

    it('will patch 2', function () {
      var mutant = new Mutant( { foo: { bar: { baz: 42 } } } )
      mutant.walk('foo').patch( { bop: 123 }, 'bar' )
      var result = mutant.get()
      assert.deepEqual( result, { foo: { bar: { baz: 42, bop: 123 } } } )
    })
  })

  describe('walk + map', function () {
    it('will set inner key', function () {
      var mutant = new Mutant( { foo: { bar: 123, baz: 42 } } )
      mutant.walk('foo').map( function ( sub, key ) {
        if ( key == 'bar' )
          sub.set( new Mutant( 456 ) )
        else
          return sub
      })
      var result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 456, baz: 42 } } )
    })

    it('will set inner key 2 ', function () {
      var mutant = new Mutant( { foo: { bar: 123, baz: 42 } } )
      mutant.walk('foo').map( function ( sub, key ) {
        if ( key == 'bar' )
          // sub.set( 456 )
          return 456
      })
      var result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 456, baz: 42 } } )
    })
  })

  describe('eachPath', function () {
    it('is a function', function () {
      var mutant = new Mutant()
      assert.isFunction( mutant.eachPath )
    })

    it('will call callback', function () {
      var data = { foo: { bar: 42 } }
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
})
