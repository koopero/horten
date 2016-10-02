const _ = require('lodash')
    , path = require('./path')
    , split = path.split
    , eachKey = require('./eachKey')
    , isTree = require('./isTree')
    , Mutant = require('./Mutant')

module.exports = function normalize() {
  var mutant

  _.map( arguments, function ( arg ) {
    if ( _.isUndefined( arg ) )
      return

    console.log('norminner', arg )

    if ( !mutant )
      mutant = new Mutant()

    walk( arg )
  })

  return mutant.result()

  function walk( value, path ) {
    if ( isTree( value ) ) {
      eachKey( value, function ( value, key ) {
        walk( value, split( path, key ) )
      } )
    } else {
      mutant.patch( value, path )
    }
  }
}
