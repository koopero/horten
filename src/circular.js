'use strict'

/*
  Utility to detect circularity when traversing objects.
*/
module.exports = circular

function circular () {
  var self = Object.create( circular.prototype )
  var stack = self._stack = []
  self.push = function( value ) {
    if ( stack.indexOf( value ) != -1 ) {
      throw new Error('Circular data detected')
    }
    stack.push( value )
  }
  self.pop = stack.pop.bind( stack )

  return self
}
