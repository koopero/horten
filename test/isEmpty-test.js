const test = require('./_test')
    , assert = test.assert
describe('isEmpty', () => {
  const isEmpty = require('../src/isEmpty')
      , test = ( value, empty ) =>
        it( JSON.stringify( value )+' => '+JSON.stringify( empty ), () => assert.equal( isEmpty( value ), empty ) )

  test( {}, true )
  test( { foo: 'bar' }, false )

})
