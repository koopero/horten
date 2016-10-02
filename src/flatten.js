const path = require('./path')
    , resolve = path.resolve
    , isTree = require('./isTree')
    , eachKey = require('./eachKey')
    , circular = require('./circular')

module.exports = function flatten ( object ) {

  const result = {}
  const circ = circular()
  walk( object, '/' )
  return result

  function walk( value, path ) {
    if ( isTree( value ) ) {
      circ.push( value )
      eachKey( value, ( sub, key ) => walk( sub, resolve( path, key ) ) )
      circ.pop()
    } else
      result[ path ] = value
  }

}
