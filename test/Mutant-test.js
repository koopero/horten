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

  xit('is an EventEmitter', function () {
    const mutant = Mutant()
    assert.isFunction( mutant.on )
    assert.isFunction( mutant.emit )
  })

  describe('initialize', function () {
    it('new', function () {
      const foo = new Mutant()
      foo.result()
    })

    it('function', function () {
      const foo = Mutant()
      foo.result()
    })

    it('from Mutant', function () {
      const ref = { foo: 'bar' }
          , a = Mutant( ref )
          , b = Mutant( a )
          , r = b.get()

      assert.equal( r, ref )
    })
  })

  it('pass a reference', function () {
    const ref = {}
        , mutant = new Mutant( ref )
        , result = mutant.result()

    assert.equal( result, ref )
  })


  describe('.isDirty', function() {
    it('will not smoke', function () {
      const mutant = new Mutant()
      assert.isFunction( mutant.isDirty )
      assert.isBoolean( mutant.isDirty() )
    })
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

  describe('.del', function () {
    it('will delete root', function () {
      const mutant = new Mutant( { foo: 'bar' } )
      mutant.del()
      assert.equal( mutant.get(), undefined )
    })

    it('will delete key', function () {
      const init = { foo: 'bar', bar: 'baz' }
          , mutant = new Mutant( init )
      mutant.del('foo')
      const result = mutant.get()
      assert.deepEqual( result, { bar: 'baz' } )
      assert.notEqual( result, init )
    })

  })

  describe('.patch', function() {
    it('will do nothing', function () {
      const ref = { foo: 42 }
          , mutant = new Mutant( ref )

      mutant.patch()
      assert.equal( mutant.isDirty(), false )
      assert.equal( mutant.result(),  ref )
    })


    it('will merge objects', function () {
      const mutant = new Mutant()
      mutant.patch( { foo: 123 } )
      mutant.patch( { bar: 456 } )
      assert.deepEqual( mutant.result(), { foo: 123, bar: 456 } )
    })

    it('will merge initial with object', function () {
      const mutant = new Mutant( { foo: 123 } )
      mutant.patch( { bar: 456 } )
      assert.deepEqual( mutant.result(), { foo: 123, bar: 456 } )
    })

    it('path', function () {
      const mutant = new Mutant()

      mutant.patch( 42, 'foo/bar' )
      const result = mutant.result()
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

      const result = mutant.result()
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
      value = 'foo'

      assert.equal( mutant.set( value ), true )
      assert.equal( mutant.result(), value )
      assert( mutant.isDirty() )
    })

    it('will set a key', function () {
      const mutant = new Mutant()
          , key = 'foo'
          , value = 'bar'
          , expect = {}

      expect[ key ] = value
      assert.equal( mutant.set( value, key ), true )
      assert.equal( mutant.isDirty(), true )
      assert.deepEqual( mutant.result(), expect )

    })

    it('will NOT set a key', function () {
      const key = 'foo'
          , value = 42
          , object = { foo: value }
          , mutant = new Mutant( object )

      assert.equal( mutant.set( value, key ), false )
      assert.equal( mutant.isDirty(), false )
      assert.equal( mutant.result(), object )
    })

    it('will set a path', function () {
      const object = { foo: { bar: 430 } }
          , mutant = new Mutant( object )

      assert.equal( mutant.set( 42, 'foo', 'bar' ), true )
      assert.equal( mutant.isDirty(), true )

      const result = mutant.result()

      assert.deepEqual( result, { foo: { bar: 42 } } )
      assert.notStrictEqual( result, object )
    })

    it('will NOT set a path', function () {
      const value = 42
          , object = { foo: { bar: value } }
          , mutant = new Mutant( object )

      assert.equal( mutant.set( value, 'foo', 'bar' ), false )
      assert.equal( mutant.isDirty(), false )
      assert.equal( mutant.result(), object )
    })

    it('will leave siblings unaltered', function () {
      const value = 42
          , ref = {}
          , object = { foo: { bar: Math.random() }, baz: ref }
          , mutant = new Mutant( object )

      assert.equal( mutant.set( Math.random(), 'foo', 'bar' ), true )
      assert.equal( mutant.isDirty(), true )

      const result = mutant.result()
      assert.equal( mutant.result().baz, ref )
    })
  })

  describe('walk + set', function () {
    it('will set', function () {
      const mutant = Mutant()
      mutant.walk('foo/bar').set( 'baz' )
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 'baz' } } )
    })

    it('will merge', function () {
      const mutant = Mutant( { foo: 42 } )
      mutant.walk('bar').set( 'baz' )
      const result = mutant.get()
      assert.deepEqual( result, { foo: 42, bar: 'baz' } )
    })

    it('will patch', function () {
      const mutant = Mutant( { foo: { bar: { baz: 42 } } } )
      mutant.walk('foo/bar').patch( { bop: 123 } )
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: { baz: 42, bop: 123 } } } )
    })

    it('will patch 2', function () {
      const mutant = Mutant( { foo: { bar: { baz: 42 } } } )
      mutant.walk('foo').patch( { bop: 123 }, 'bar' )
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: { baz: 42, bop: 123 } } } )
    })
  })

  describe('walk + map', function () {
    it('will set inner key', function () {
      const mutant = Mutant( { foo: { bar: 123, baz: 42 } } )
      mutant.walk('foo').map( function ( sub, key ) {
        if ( key == 'bar' )
          sub.set( Mutant( 456 ) )
        else
          return sub
      })
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 456, baz: 42 } } )
    })

    it('will set inner key 2 ', function () {
      const mutant = Mutant( { foo: { bar: 123, baz: 42 } } )
      mutant.walk('foo').map( function ( sub, key ) {
        if ( key == 'bar' )
          return 456
      })
      const result = mutant.get()
      assert.deepEqual( result, { foo: { bar: 456, baz: 42 } } )
    })
  })

  describe('eachPath', function () {
    it('is a function', function () {
      const mutant = Mutant()
      assert.isFunction( mutant.eachPath )
    })

    it('will call callback', function () {
      const data = { foo: { bar: 42 } }
          , mutant = Mutant( data )

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
