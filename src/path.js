const path = module.exports

const isString = ( val ) => 'string' == typeof val
    , isArrayLike = ( val ) => ( 'object' == typeof val ) && ( 'number' == typeof val.length )

const NS = require('./namespace')
    , SEP = NS.SEP

path.sep = SEP

path.blank = function () {
  return array( arguments )

  function array( args ) {
    for ( var i = 0; i < args.length; i ++ ) {
      var arg = args[i]
      if ( 'string' == typeof arg ) {
        if ( !arg.match( /^\/*$/ ) )
          return false
      } else if ( arg.length )
        if ( !array( arg ) )
          return false
    }

    return true
  }
}

path.last = function () {
  var p = path.split( arguments )
  if ( p.length )
    return p[ p.length - 1 ]
}

path.simple = function ( str ) {
  var count = 0
  array( arguments )
  return count == 1

  function array( args ) {
    for ( var i = 0; i < args.length; i ++ ) {
      var arg = args[i]
      if ( 'string' == typeof arg ) {
        if ( !arg.match( /^\/*$/ ) ) {
          count ++
        }
      } else if ( arg.length )
        array( arg )

      if ( count > 1 )
        return
    }
  }
}

path.slice = function ( arr, start ) {
  start = parseInt( start ) || 0
  return path.split( Array.prototype.slice.call( arr, start ) )
}

path.split = function () {
  //
  // Shortcuts
  //
  if ( arguments.length == 1
    && Array.isArray( arguments[0] )
    && arguments[0][ NS.splitResult ]
  )
    return arguments[0]

  //
  // Do the actual work
  //

  var result = []
  array( arguments )
  result[  NS.splitResult  ] = true

  Object.freeze( result )

  return result

  function array( arr ) {
    for ( var i = 0; i < arr.length; i ++ )
      arg( arr[i] )
  }

  function arg( arg ) {
    if ( !isString( arg ) && isArrayLike( arg ) ) {
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

  array( arguments )

  if ( !result.length || result[result.length-1] != SEP )
    result = result + SEP

  return result

  function array( args ) {
    for( var i = 0; i < args.length; i ++ ) {
      eachArg( args[i] )
    }
  }

  function eachArg( arg ) {
    if ( !isString( arg ) && isArrayLike( arg ) ) {
      return array( arg )
    }

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
}

path.startsWith = function( a ) {
  a = path.split( a )
  let b = path.slice( arguments, 1 )
  let i = 0
  do {
    if ( i >= a.length && i >= b.length )
      return true

    if ( i >= b.length )
      return false

    if ( i >= a.length )
      return path.slice( b, a.length )

    if ( a[i] != b[i] )
      return false

    i ++
  } while ( true )
}


path.string = path.resolve

path.equal = function ( a, b ) {
  if ( arguments.length < 1 )
    throw new Error('Insufficient arguments')

  var k = arguments.length - 1
  for ( var i = 0; i < k; i ++  )
    if ( path.string( arguments[i] ) != path.string( arguments[i+1] ) )
      return false

  return true
}
