
const assert = require('chai').assert

describe('path', () => {
  const path = require('../src/path')

  describe('resolve', () => {
    const resolve = path.resolve

    const test = ( args, result, desc ) =>
      it(
        desc || ( JSON.stringify( args )+' => '+result ),
        () => assert.equal( resolve.apply( null, args ), result )
      )

    test([],      '/', 'noargs => /' )
    test(['/'],   '/' )
    test(['foo'],   'foo/' )
    test(['foo/bar'],   'foo/bar/' )
    test(['foo////bar'],   'foo/bar/' )
    test(['foo','bar'],   'foo/bar/' )
    test(['foo/bar'],   'foo/bar/' )


    test([ 'x', 0.5 ],   'x/0/' )


  })

  describe('split', () => {
    const split = path.split

    const test = ( args, result, desc ) =>
      it(
        desc || ( JSON.stringify( args )+' => '+JSON.stringify( result ) ),
        () => assert.deepEqual( split.apply( null, args ), result )
      )

    test([], [] )
    test(['foo'], ['foo'] )
    test(['foo/bar'], ['foo','bar'] )
    test(['foo///bar/'], ['foo','bar'] )
    test(['foo',1.5,'bar'], ['foo','1','bar'] )
    test(['foo',0,'bar'], ['foo','0','bar'] )
    test(['/'], [] )
    test(['/','/'], [] )
    test(['///'], [] )

  })
})
