module.exports = DeEcho

const Mutant = require('./Mutant')

function DeEcho() {
  const self = Object.create( DeEcho.prototype )
      , echo = Mutant()

  self.send = function( data ) {

  }

  self.receive = function ( data ) {
    data = Mutant( data )
    return data.get()
  }

  return self
}
