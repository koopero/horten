module.exports = unset

const slice = require('./path').slice
    , Mutant = require('./Mutant')

function unset( data ) {
  const path = slice( arguments, 1 )
      , mutant = Mutant( data )

  mutant.del( path )

  return mutant.get()
}
