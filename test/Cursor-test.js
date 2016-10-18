'use strict'

const test = require('./_test')
    , assert = test.assert
    , assertPathEqual = test.assertPathEqual

const Mutant = require('../src/Mutant')

describe('Cursor', () => {
  const Cursor = require('../src/Cursor')

  it('will not smork', () => {
    const cursor = new Cursor()

  })

  it('will attach to root ', () => {
    const root = new Mutant()
        , cursor = new Cursor()

    cursor.root = root

    assert.equal( cursor.root, root )
  })

  it('will set path', () => {
    const root = new Mutant()
        , cursor = new Cursor()

    cursor.root = root
    cursor.path = 'foo/bar/'

    assert.equal( cursor.mutant, root.walk('foo', 'bar' ) )
  })


  it('will get the value at a path', () => {
    const root = new Mutant( { foo: { bar: 'baz'}})
        , cursor = new Cursor()

    cursor.root = root
    cursor.path = 'foo/bar/'

    assert.equal( cursor.value, 'baz' )
  })

  it('will set the value at a path', () => {
    const root = new Mutant( )
        , ref = { sparky: true }
        , cursor = new Cursor()

    cursor.root = root
    cursor.path = '////foo///bar////'
    cursor.value = ref

    assert.deepEqual( root.get(), { foo: { bar: ref } } )
    assert.equal( root.get( 'foo', 'bar'), ref )
  })

  it('will send events without delay', () => {
    const root = new Mutant( )
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
    const root = new Mutant( )
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
    const root = new Mutant( { foo: 'bar' } )
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
    const root = new Mutant()
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
    const root = new Mutant()
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
    const root = new Mutant()
        , cursor = new Cursor()

    cursor.mutant = root
    cursor.listening = true
    cursor.delay = 0
    // cursor.echo = false

    cursor.on('delta', ( delta ) => {
      console.error(delta)
      assert.fail('It echoed')
    })

    // cursor.patch('bar', 'foo' )
    cursor.patch('bar', 'foo' )
  })

})
