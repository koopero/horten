const test = require('./_test')
    , assert = test.assert
    , assertPathEqual = test.assertPathEqual

describe('Mutant structure', function() {
  const Mutant = require('../src/Mutant')

  describe('walk', function () {
    it('walks nowhere', function () {
      const mutant = new Mutant()
          , sub = mutant.walk()

      assert.equal( sub, mutant )
    })

    it('walks to sub', function () {
      const mutant = new Mutant()
          , path = test.path()
          , sub = mutant.walk( path )

      assertPathEqual( sub.path, path )
      assert.equal( sub.root, mutant )
    })

    it('walks to pre-set sub', function () {
      const mutant = new Mutant( { foo: { baz: 'bar'} } )
          , path = 'foo'
          , sub = mutant.walk( path )

      assertPathEqual( sub.path, path )
      assert.equal( sub.root, mutant )
      assert.deepEqual( sub.get(), { baz: 'bar'} )
    })

    it('walks to post-patched sub', function () {
      const mutant = new Mutant()
          , path = 'foo'
          , sub = mutant.walk( path )

      assertPathEqual( sub.path, path )
      assert.equal( sub.root, mutant )

      mutant.patch( { foo: { baz: 'bar'} } )
      const subB = mutant.walk( path )
      assert.equal( sub, subB )

      assert.deepEqual( sub.get(), { baz: 'bar'} )
    })

    it('walks to a deleted & post-patched sub', function () {
      const mutant = new Mutant( { foo: 'baz' } )
          , path = 'foo'
          , sub = mutant.walk( path )

      assertPathEqual( sub.path, path )
      assert.equal( sub.root, mutant )

      mutant.patch( { foo: { baz: 'bar'} } )
      const subB = mutant.walk( path )
      assert.equal( sub, subB )

      assert.deepEqual( sub.get(), { baz: 'bar'} )
    })
  })

  describe('persistance', () => {
    it('will remain through value change', () => {
      const root = new Mutant( { foo: 'bar'} )
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
