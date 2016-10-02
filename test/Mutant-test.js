const test = require('./_test')
    , assert = test.assert

describe('Mutant', function() {
  const Mutant = require('../src/Mutant')
  it('not smoke', function () {
    const foo = new Mutant()
    foo.result()
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
})
