const H = require('../index')
    , NS = H.NS
    , util = H.util
    , Mutant = H.Mutant
    , test = require('./_test')
    , assert = test.assert

describe('mutate', () => {
  describe('initialize', () => {

    it('will set primitives', () => {
      const root = new H.Mutant()
          , data = test.number()

      assert.equal( root.get(), undefined )

      const result = root[ NS.mutate ]( data, [], {} )

      assert.equal( root.get(), data )

      assert( result.changed )
      assert.equal( result.delta, data )
    })

    it('primitive to path', () => {
      const data = test.number()
          , path = test.path()
          , root = new H.Mutant()
          , options = {}

      let result = root[ NS.mutate ]( data, path, options )

      assert.deepEqual( root.get(), H.util.wrap( data, path ) )
      assert.deepEqual( result.delta, H.util.wrap( data, path ) )

    })
  })

  it('listen to cursor, then patch', ( done ) => {
    const path = test.path()
        , noise = test.data()
        , ref = test.number()
        , data = H.util.compose( test.number(), H.util.wrap( ref, path ) )
        , root = new H.Mutant()
        , cursor = new H.Cursor({
          listening: true,
          root,
          path,
          onValue
        })

    setTimeout( () => { root.patch( data ) }, 50 )

    function onValue( value ) {
      assert.equal( value, ref )
      done()
    }

  })

  describe('unset', () => {
    it('will delete a key', () => {
      const data = { foo: 'bar', baz: 'bop' }
          , root = new H.Mutant( data )

      let result = root[ NS.mutate ]( null, ['baz'], { unset: true } )
      assert.deepEqual( root.get(), { foo: 'bar' } )
      assert.notEqual( root.get(), data )
    })
  })
})
