const path = require('./path')
    , split = path.split
    , eachKey = require('./eachKey')
    , hasKeys = require('./hasKeys')
    , isArray = ( val ) => Array.isArray( val )
    , Mutant = require('./Mutant')
    , isUndefined = ( val ) => 'undefined' == typeof val


module.exports = function normalize() {
  var mutant

  eachKey( arguments, function ( arg ) {
    if ( isUndefined( arg ) )
      return

    if ( !mutant )
      mutant = new Mutant()

    walk( arg )
  })

  return mutant.result()

  function walk( value, path ) {
    if ( isArray( value ) ){
      mutant.patch( [], path )
    }

    if ( hasKeys( value ) ) {
      eachKey( value, function ( value, key ) {
        walk( value, split( path, key ) )
      } )
    } else {
      mutant.patch( value, path )
    }
  }
}
