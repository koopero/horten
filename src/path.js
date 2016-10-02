const path = exports

const SEP = '/'

path.sep = SEP

path.blank = function ( path ) {
  if ( path == '/' )
    return true

  if ( !path.length )
    return true
}

path.simple = function ( str ) {
  if ( Array.isArray( str ) ) {
    return str.length == 1
  }

  if ( 'string' != typeof str )
    return false

  if ( str.indexOf( SEP ) != -1 )
    return false

  return true
}

path.split = function () {
  const result = []

  array( arguments )

  return result

  function array( arr ) {
    for ( var i = 0; i < arr.length; i ++ )
      arg( arr[i] )
  }

  function arg( arg ) {
    if ( Array.isArray( arg ) ) {
      array( arg )
    }

    arg = path.stringify( arg )

    if ( 'string' == typeof arg ) {
      arg
      .split( SEP )
      .filter( a => !!a )
      .forEach( a => result.push( a ) )
    }
  }
}

path.stringify = function ( arg ) {
  if ( 'boolean' == typeof arg ) {
    return arg ? '1' : '0'
  }

  if ( 'number' == typeof arg ) {
    return Math.floor(arg || 0 ).toFixed(0)
  }

  return arg
}

path.resolve = function () {
  var result = ''

  for( var i = 0; i < arguments.length; i ++ ) {
    eachArg( arguments[i] )
  }

  function eachArg( arg ) {
    arg = path.stringify( arg )

    if ( 'string' == typeof arg ) {
      arg.split( SEP ).map( eachToken )
    }
  }

  function eachToken( tok ) {
    if ( !tok )
      return

    result = result + tok + SEP
  }

  if ( !result.length || result[result.length-1] != SEP )
    result = result + SEP

  return result
}
