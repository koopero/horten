'use strict'

var test = require('./_test')
    , assert = test.assert
    , assertPathEqual = test.assertPathEqual

var Mutant = require('../src/Mutant')
    , eachKey = require('../src/eachKey')
    , wrap = require('../src/wrap')

describe('Cursor', () => {
  var Cursor = require('../src/Cursor')

  describe('constructor', () => {
    it('will not smork', () => {
      var cursor = new Cursor()
    })

    it('will init options', () => {
      var root = new Mutant()
          , options = {
            root: root
          }
          , cursor = new Cursor( options )

      eachKey( options, ( value, key ) => {
        assert.equal( cursor[key], options[key] )
      })
    })

  })


  it('will attach to root ', () => {
    var root = new Mutant()
        , cursor = new Cursor()

    cursor.root = root

    assert.equal( cursor.root, root )
  })

  it('will set path', () => {
    var root = new Mutant()
        , cursor = new Cursor()

    cursor.root = root
    cursor.path = 'foo/bar/'

    assert.equal( cursor.mutant, root.walk('foo', 'bar' ) )
  })


  it('will get the value at a path', () => {
    var root = new Mutant( { foo: { bar: 'baz'}})
        , cursor = new Cursor()

    cursor.root = root
    cursor.path = 'foo/bar/'

    assert.equal( cursor.value, 'baz' )
  })

  it('will set the value at a path', () => {
    var root = new Mutant( )
        , ref = { sparky: true }
        , cursor = new Cursor()

    cursor.root = root
    cursor.path = '////foo///bar////'
    cursor.value = ref

    assert.deepEqual( root.get(), { foo: { bar: ref } } )
    assert.equal( root.get( 'foo', 'bar'), ref )
  })

  it('will send events without delay', () => {
    var root = new Mutant( )
        , cursor = new Cursor()

    var calls = 0
    cursor.on('change', () => {
      calls ++
    })

    cursor.mutant = root
    cursor.listening = true
    cursor.delay = 0

    root.set( 42 )
    assert.equal( calls, 1 )
  })

  it('will delay events', ( cb ) => {
    var root = new Mutant( )
        , cursor = new Cursor()

    var calls = 0
    cursor.on('change', () => {
      calls++
    })

    cursor.mutant = root
    cursor.listening = true
    cursor.delay = 30

    root.set( 1 )
    root.set( 2 )
    root.set( 3 )
    root.set( 4 )

    assert.equal( calls, 0 )

    setTimeout( function () {
      assert.equal( calls, 0 )
    }, 10 )

    setTimeout( function () {
      assert.equal( calls, 1 )
      cb()
    }, 50 )
  })

  it('will accumulate deltas', ( cb ) => {
    var root = new Mutant( { foo: 'bar' } )
        , cursor = new Cursor()
        , time = 30

    var calls = 0


    cursor.mutant = root
    cursor.listening = true
    cursor.delay = time

    root.set( 'bar', 'foo' ) // Doesn't set anything, no delta
    assert.equal( calls, 0 )

    setTimeout( function () {
      root.patch( 42, 'baz')
      assert.equal( calls, 0 )
    }, time / 4 )

    setTimeout( function () {
      root.patch( 123, 'bop' )
      assert.equal( calls, 0 )
    }, time / 2 )

    cursor.on('delta', ( delta ) => {
      assert.deepEqual( delta, { baz: 42, bop: 123 } )
      cb()
    })
  })

  it('will receive delta from subMutant', ( cb ) => {
    var root = new Mutant()
        , sub = root.walk('foo')
        , cursor = new Cursor()

    cursor.mutant = root
    cursor.listening = true
    cursor.delay = 0

    cursor.on('delta', ( delta ) => {
      assert.deepEqual( delta, { foo: 'bar' } )
      cb()
    })

    sub.set('bar')
  })

  it('will receive value from subMutant', ( cb ) => {
    var root = new Mutant()
        , sub = root.walk('foo')
        , cursor = new Cursor()

    cursor.mutant = root
    cursor.listening = true
    cursor.delay = 0

    cursor.on('value', ( value ) => {
      assert.deepEqual( value, { foo: 'bar' } )
      cb()
    })

    sub.set('bar')
  })

  it('will reject echos', () => {
    var root = new Mutant()
        , cursor = new Cursor()

    cursor.mutant = root
    cursor.listening = true
    cursor.delay = 0
    // cursor.echo = false

    cursor.on('delta', ( delta ) => {
      assert.fail('It echoed')
    })

    // cursor.patch('bar', 'foo' )
    cursor.patch('bar', 'foo' )
  })

  it('will reject echos', () => {
    var root = new Mutant()
        , cursor = new Cursor()

    cursor.mutant = root
    cursor.listening = true
    cursor.delay = 0
    // cursor.echo = false

    cursor.on('delta', ( delta ) => {
      assert.fail('It echoed')
    })

    // cursor.patch('bar', 'foo' )
    cursor.patch('bar', 'foo' )
  })

  it('will only send necessary delta ', () => {
    var data = test.data()
        , root = new Mutant( data )
        , cursor = new Cursor()
        , path = test.path()
        , patch = test.number()
        , child = root.walk( path )

    cursor.mutant = root
    cursor.listening = true
    cursor.delay = 0
    // cursor.echo = false

    cursor.on('delta', ( delta ) => {
      assert.deepEqual( delta, wrap( patch, path ))
    })

    // cursor.patch('bar', 'foo' )
    child.patch( patch )
  })

  describe('events', () => {
    it('delta from upstream mutant', ( cb ) => {
      var root = new Mutant()
          , path = test.path()
          , child = root.walk( path )
          , data = test.data()
          , cursor = new Cursor( {
            root: root,
            listening: true,
            delay: 0,
            onDelta: onDelta
          } )

      // console.log('path',path)


      assert.equal( cursor.mutant, root )
      assert.equal( cursor.mutant.walk( path ), child )
      assert.notEqual( child, root )
      assert.deepEqual( child.path, path )

      var calls = 0
      function onDelta( delta ) {
        assert.deepEqual( delta, wrap( data, path ) )
        calls++
      }

      child.set( data )

      setTimeout( () => {
        assert.equal( calls, 1 )
        cb()
      }, 10 )
    })
  })

  describe('.hold', () => {
    it('will be off by default', () => {
      var cursor = new Cursor()
      assert.equal( cursor.hold, false )
    })

    it('will always be boolean', () => {
      var cursor = new Cursor({
        hold: 'yes'
      })
      assert.equal( cursor.hold, true )

      cursor.hold = null
      assert.equal( cursor.hold, false )

      cursor.hold = 1
      assert.equal( cursor.hold, true )

      cursor.hold = 0
      assert.equal( cursor.hold, false )
    })

    it('will hold events until release', () => {
      var root = new Mutant()
          , cursor = new Cursor()
          , data = { foo: 'bar' }

      var calls = 0

      cursor.on('delta', function ( result ) {
        calls ++
        assert.deepEqual( result, data )
      })

      cursor.root = root
      cursor.listening = true
      cursor.delay = 0
      cursor.hold = true

      root.patch( data )

      assert.equal( calls, 0 )

      cursor.release()

      assert.equal( calls, 1 )
    })
  })

})
