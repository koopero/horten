'use strict'

var path = require('./path')
    , resolve = path.resolve
    , hasKeys = require('./hasKeys')
    , eachKey = require('./eachKey')
    , circular = require('./circular')

module.exports = function flatten ( object ) {

  var result = {}
  var circ = circular()
  walk( object, '/' )
  return result

  function walk( value, path ) {
    if ( hasKeys( value ) ) {
      circ.push( value )
      eachKey( value, ( sub, key ) => walk( sub, resolve( path, key ) ) )
      circ.pop()
    } else
      result[ path ] = value
  }

}
