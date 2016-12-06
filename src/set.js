'use strict'

module.exports = set

const slice = require('./path').slice
    , Mutant = require('./Mutant')

function set( subject, value ) {
  const path = slice( arguments, 2 )
      , mutant = Mutant( subject )

  mutant.set( value, path )

  return mutant.get()
}
