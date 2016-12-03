'use strict'

module.exports = unset

var slice = require('./path').slice
    , Mutant = require('./Mutant')

function unset( data ) {
  var path = slice( arguments, 1 )
      , mutant = Mutant( data )

  mutant.del( path )

  return mutant.get()
}
