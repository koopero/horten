module.exports = isEmpty

function isEmpty( a ) {
  if ( a === undefined || a === null )
    return true

  if ( 'object' == typeof a ) {
    for ( var key in a )
      if ( a.hasOwnProperty( key ) )
        return false

    return true
  }

  return false
}
