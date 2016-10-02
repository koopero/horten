const test = exports

test.assert = require('chai').assert

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
