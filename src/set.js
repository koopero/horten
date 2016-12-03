'use strict'

module.exports = set

var slice = require('./path').slice
    , Mutant = require('./Mutant')

function set( subject, value ) {
  var path = slice( arguments, 2 )
      , mutant = Mutant( subject )

  mutant.set( value, path )

  return mutant.get()
}
