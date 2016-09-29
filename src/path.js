const path = exports

const SEP = '/'

path.sep = SEP

path.split = function () {
  const result = []

  array( arguments )
  // str =>
  //   str.split(/[\/\.]+/g)
  //   .filter( a => !!a )
  return result

  function array( arr ) {
    for ( var i = 0; i < arr.length; i ++ )
      arg( arr[i] )
  }

  function arg( arg ) {
    if ( Array.isArray( arg ) ) {
      array( arg )
    }

    if ( 'number' == typeof arg ) {
      arg = Math.floor(arg || 0 ).toFixed(0)
    }

    if ( 'string' == typeof arg ) {
      arg
      .split( SEP )
      .filter( a => !!a )
      .forEach( a => result.push( a ) )
    }
  }
}


path.resolve = function () {
  var result = ''

  for( var i = 0; i < arguments.length; i ++ ) {
    eachArg( arguments[i] )
  }

  function eachArg( arg ) {
    if ( 'number' == typeof arg )
      arg = Math.floor(arg).toFixed(0)

    if ( 'string' == typeof arg ) {
      arg.split( SEP ).map( eachToken )
    }
  }

  function eachToken( tok ) {
    tok = tok || ''

    while ( tok[0] == SEP )
      tok = tok.substr( 1 )

    result = result + tok

    if ( result[result.length-1] != SEP )
      result = result + SEP
  }

  if ( result[result.length-1] != SEP )
    result = result + SEP

  return result
}
