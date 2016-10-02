const Mutant = require('./Mutant')
    , normalize = require('./normalize')

const _ = require('lodash')

module.exports = function compose() {
  var mutant

  _.map( arguments, function ( arg ) {
    if ( _.isUndefined( arg ) )
      return

    arg = normalize( arg )

    if ( !mutant )
      mutant = new Mutant( arg )
    else
      mutant.patch( arg )
  })

  return mutant && mutant.result()
}
