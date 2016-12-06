'use strict'

const Mutant = require('./Mutant')
    , normalize = require('./normalize')
    , eachKey = require('./eachKey')
    , isUndefined = ( val ) => 'undefined' == typeof val

module.exports = function compose() {
  var mutant

  eachKey( arguments, function ( arg ) {
    if ( isUndefined( arg ) )
      return

    arg = normalize( arg )

    if ( !mutant )
      mutant = new Mutant( arg )
    else
      mutant.patch( arg )
  })

  return mutant && mutant.result()
}
