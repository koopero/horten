module.exports = Echo

const Mutant = require('./Mutant')

function Echo() {
  const self = Object.create( Echo.prototype )
      , echo = new Mutant( {} )

  self.send = function( data ) {
    // console.log('Echo.send', data )
    echo.patch( data )
  }

  self.receive = function ( data ) {
    // console.trace('Echo.receive', data )

    data = Mutant( data )

    echo.eachPath( function ( value, path ) {
      const echoValue = echo.get( path )

      if ( value == echoValue )
        data.del( path )

      echo.del( path )
    })

    var delta = data.get()
    return delta
  }

  return self
}
