
var assert = require('chai').assert

describe('path', () => {
  var path = require('../src/path')

  describe('resolve', () => {
    var resolve = path.resolve

    var test = ( args, result, desc ) =>
      it(
        desc || ( JSON.stringify( args )+' => '+result ),
        () => assert.equal( resolve.apply( null, args ), result )
      )

    test([],      '/', 'noargs => /' )
    test(['/'],   '/' )
    test(['/', 'foo'],   'foo/' )
    test(['foo'],   'foo/' )
    test(['foo/bar'],   'foo/bar/' )
    test(['foo////bar'],   'foo/bar/' )
    test(['foo','bar'],   'foo/bar/' )
    test(['foo/bar'],   'foo/bar/' )


    test([ 'x', 0.5 ],   'x/0/' )

    test([ 'x', true ],   'x/1/' )
    test([ 'x', false ],   'x/0/' )
    test([ ['x', false] ],   'x/0/' )


    it('works with arguments', function () {
      function wrap() {
        return resolve( arguments )
      }

      assert.deepEqual( wrap( 'foo', 'bar' ), 'foo/bar/' )
    })

  })

  describe('blank', () => {
    var blank = path.blank

    it('works with arguments', function () {
      function wrap() {
        return blank( arguments )
      }

      assert.deepEqual( wrap( 'foo', 'bar' ), false )
      assert.deepEqual( wrap( 'foo' ), false )
      assert.deepEqual( wrap( ['foo'] ), false )
      assert.deepEqual( wrap(), true )
      assert.deepEqual( wrap('/', '/'), true )

    })
  })

  describe('last', () => {
    var last = path.last

    it('works with arguments', function () {
      function wrap() {
        return last( arguments )
      }

      assert.deepEqual( wrap( 'foo', 'bar' ), 'bar' )
      assert.deepEqual( wrap(), undefined  )
      assert.deepEqual( wrap( ['foo'] ), 'foo' )
    })
  })


  describe('simple', () => {
    var simple = path.simple

    it('works with arguments', function () {
      function wrap() {
        return simple( arguments )
      }

      assert.deepEqual( wrap( 'foo', 'bar' ), false )
      assert.deepEqual( wrap( 'foo' ), true )
      assert.deepEqual( wrap( ['foo'] ), true )
    })
  })

  describe('split', () => {
    var split = path.split

    var test = ( args, result, desc ) =>
      it(
        desc || ( JSON.stringify( args )+' => '+JSON.stringify( result ) ),
        () => assert.deepEqual( split.apply( null, args ), result )
      )

    test([], [] )
    test([[]], [] )
    test([[],[]], [] )

    test(['foo'], ['foo'] )
    test(['foo/bar'], ['foo','bar'] )
    test(['foo///bar/'], ['foo','bar'] )
    test(['foo',1.5,'bar'], ['foo','1','bar'] )
    test(['foo',0,'bar'], ['foo','0','bar'] )
    test([['foo',0,'bar']], ['foo','0','bar'] )
    test([[['foo',0,'bar']]], ['foo','0','bar'] )

    test(['/'], [] )
    test([['/']], [] )

    test(['/','/'], [] )
    test(['///'], [] )

    test([ 'x', 0.5 ],   ['x','0'] )
    test([ 'x', true ],  [ 'x','1'] )
    test([ 'x', false ],  ['x','0'] )
    test([ ['x', false] ], ['x','0'] )
    test([ ['x', false], 'y' ], ['x','0','y'] )


    it('works with arguments', function () {
      function wrap() {
        return split( arguments )
      }

      assert.deepEqual( wrap( 'foo', 'bar' ), ['foo','bar']  )
    })

  })

  describe('equal', () => {
    var equal = path.equal
    it('works', () => {
      assert.equal( equal('foo/', ['foo'] ), true )
      assert.equal( equal('foo/', [] ), false )

    })
  })

})
