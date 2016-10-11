module.exports = Echo

const Mutant = require('./Mutant')

function Echo() {
  const self = Object.create( Echo.prototype )
      , echo = Mutant( {} )

  self.send = function( data ) {
    echo.patch( data )
  }

  self.receive = function ( data ) {
    data = Mutant( data )

    echo.eachPath( function ( value, path ) {
      const echoValue = echo.get( path )

      if ( value == echoValue )
        data.del( path )

      echo.del( path )
    })

    return data.get()
  }

  return self
}
