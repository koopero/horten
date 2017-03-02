'use strict'

module.exports = Echo

const Mutant = require('./Mutant')
    , hasKeys = require('./hasKeys')
    , isEmpty = require('./isEmpty')

function Echo() {
  const self = Object.create( Echo.prototype )
      , echo = new Mutant( {} )

  self.send = function( data ) {
    // console.log('Echo.send', data )
    echo.patch( data )
  }

  self.receive = function ( data ) {

    data = new Mutant( data )

    echo.eachPath( function ( value, path ) {
      const echoValue = echo.get( path )
      if ( value == echoValue )
        data.unset( path )

      echo.unset( path )
    })

    echo.optimize()
    data.optimize()

    const delta = data.get()
    return delta
  }

  return self
}
