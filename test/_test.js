var test = exports
    , assert = require('chai').assert
    , path = require('../src/path')

test.assert = assert

test.wrapEqual = function( func ) {
  return function( args, expect, desc ) {

    desc = desc || ( JSON.stringify( args )+' === '+JSON.stringify( expect ) )

    it( desc, function () {
      var result = func.apply( null, args )
      test.assert.equal( result, expect )
    })

  }
}

test.wrapEquiv = function( func ) {
  return function( args, expect, desc ) {

    desc = desc || ( JSON.stringify( args )+' == '+JSON.stringify( expect ) )

    it( desc, function () {
      var result = func.apply( null, args )
      test.assert.deepEqual( result, expect )
    })

  }
}

test.assertPathEqual = function ( a, b, mesg ) {
  assert.deepEqual( path.string( a ), path.string( b ), mesg )
}


test.number = () =>
  Math.round( Math.random() * 4 ) * Math.pow( 2, Math.round( Math.random() * 8 - 3 ) )


var DATA_KEYS = ['echelon','cadillac','funfur','stakeout','vulcan','verbiage']

test.data = function() {
  var result = {}
  for ( var i = 0; i < 3; i ++ ) {
    var ind = Math.floor( DATA_KEYS.length * Math.random() )
      , key = DATA_KEYS[ind]

    result[key] = test.number()
  }

  return result
}

var PATH_KEYS = ['computron','oscillator','ostrich','oven','other']

test.path = function() {
  var result = []
    , length = Math.round( Math.random() * 2 ) + 1

  for ( var i = 0; i < length; i ++ ) {
    var ind = Math.floor( PATH_KEYS.length * Math.random() )
      , key = PATH_KEYS[ind]

    result.push( key )
  }

  return result
}
