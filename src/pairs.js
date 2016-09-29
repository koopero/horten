module.exports = pairs

const path = require('./path')
    , SEP = path.sep

function pairs ( object ) {
  const joinPath = ( a, b ) => ( a == SEP ? '' : a ) + b + SEP

  const result = []
  walk( object, SEP )
  return result

  function walk( ob, path ) {
    if ( 'object' != typeof ob ) {
      result.push( [ path, ob ] )
    } else {
      for ( var k in ob ) {
        if ( ob.hasOwnProperty( k ) ) {
          walk( ob[k], joinPath( path, k ) )
        }
      }
    }
  }

}
