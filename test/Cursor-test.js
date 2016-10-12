'use strict'

const test = require('./_test')
    , assert = test.assert
    , assertPathEqual = test.assertPathEqual

const Mutant = require('../src/Mutant')

describe('Cursor', function () {
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

  it('will send events', () => {
    const root = new Mutant( )
        , cursor = new Cursor()

    cursor.on('change')
  })
})
