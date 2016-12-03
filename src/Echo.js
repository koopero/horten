'use strict'

module.exports = Echo

var Mutant = require('./Mutant')

function Echo() {
  var self = Object.create( Echo.prototype )
      , echo = new Mutant( {} )

  self.send = function( data ) {
    // console.log('Echo.send', data )
    echo.patch( data )
  }

  self.receive = function ( data ) {
    // console.trace('Echo.receive', data )

    data = new Mutant( data )

    echo.eachPath( function ( value, path ) {
      var echoValue = echo.get( path )

      if ( value == echoValue )
        data.del( path )

      echo.del( path )
    })

    var delta = data.get()
    return delta
  }

  return self
}
