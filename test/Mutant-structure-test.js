const test = require('./_test')
    , assert = test.assert
    , assertPathEqual = test.assertPathEqual

describe('Mutant structure', function() {
  const Mutant = require('../src/Mutant')

  describe('walk', function () {
    it('walks nowhere', function () {
      const mutant = Mutant()
          , sub = mutant.walk()

      assert.equal( sub, mutant )
    })

    it('walks to sub', function () {
      const mutant = Mutant()
          , path = test.path()
          , sub = mutant.walk( path )

      assertPathEqual( sub.path, path )
      assert.equal( sub.root, mutant )
    })
  })

  describe('persistance', () => {
    it('will remain through value change', () => {
      const root = Mutant( { foo: 'bar'} )
      const subA = root.walk('foo')

      assert.deepEqual( subA.get(), 'bar' )

      root.set( 42 )

      const subB = root.walk('foo')

      assert.equal( subB, subA )

      assert.equal( root.get(), 42 )
      // assert.deepEqual( subA.get(), 'bar' )
      subA.set('baz')

      assert.deepEqual( root.get(), { foo: 'baz' } )
    })
  })
})
