const path = exports

const _ = require('lodash')

const SEP = '/'

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
  const p = path.split( arguments )
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
  const result = []

  array( arguments )

  return result

  function array( arr ) {
    for ( var i = 0; i < arr.length; i ++ )
      arg( arr[i] )
  }

  function arg( arg ) {
    if ( !_.isString( arg ) && _.isArrayLike( arg ) ) {
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
    if ( !_.isString( arg ) && _.isArrayLike( arg ) ) {
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
