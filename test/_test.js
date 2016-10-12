const test = exports
    , assert = require('chai').assert
    , path = require('../src/path')

test.assert = assert

test.wrapEqual = function( func ) {
  return function( args, expect, desc ) {

    desc = desc || ( JSON.stringify( args )+' === '+JSON.stringify( expect ) )

    it( desc, function () {
      const result = func.apply( null, args )
      test.assert.equal( result, expect )
    })

  }
}

test.wrapEquiv = function( func ) {
  return function( args, expect, desc ) {

    desc = desc || ( JSON.stringify( args )+' == '+JSON.stringify( expect ) )

    it( desc, function () {
      const result = func.apply( null, args )
      test.assert.deepEqual( result, expect )
    })

  }
}

test.assertPathEqual = function ( a, b, mesg ) {
  assert.deepEqual( path.string( a ), path.string( b ), mesg )
}
