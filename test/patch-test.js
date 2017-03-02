const H = require('../index')
    , test = require('./_test')
    , assert = test.assert

describe('patch', () => {
  it('weird patch from horten-control', ( done ) => {
    const path = test.path()
        , data = 42
        , wrapped = H.util.wrap( data, path )
        , root = new H.Mutant()
        , cursor = new H.Cursor( {
          listening: true,
          root,
          path,
          onValue
        })

    console.log('Path', cursor.path )
    console.log('wrapped', wrapped )

    root.patch( wrapped )
    assert.deepEqual( root.get(), wrapped )

    // cursor should pick up this value
    function onValue( value ) {
      assert.equal( value, data )
      done()
    }
  })
})
