'use strict'

module.exports = pairs

var SEP = require('./path').sep
    , pathJoin = require('./pathJoin')
    , hasKeys = require('./hasKeys')
    , eachKey = require('./eachKey')

function pairs ( object ) {
  var result = []
  walk( object, SEP )
  return result

  function walk( ob, path ) {
    if ( !hasKeys( ob ) ) {
      result.push( [ path, ob ] )
    } else {
      for ( var k in ob ) {
        if ( ob.hasOwnProperty( k ) ) {
          walk( ob[k], pathJoin( path, k ) )
        }
      }
    }
  }

}
