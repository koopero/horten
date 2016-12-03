var test = require('./_test')
    , assert = test.assert


describe('normalize', function () {
  var normalize = require('../src/normalize')

  var testEqual = test.wrapEqual( normalize )
      , testEquiv = test.wrapEquiv( normalize )

  testEqual( [4], 4 )


  testEquiv(
    [
      {
        '/foo/bar/': 4,
        'bar':3,
      }
    ],
    {
      foo: {
        bar: 4
      },
      bar: 3
    }
  )

  describe( 'passes primitives', function () {
    testEqual( [ 42 ], 42 )
    testEqual( [ null, 42 ], 42 )
    testEqual( [ 42, null ], null )
    testEqual( [ 42, undefined ], 42 )
  })

  xdescribe( 'passes arrays', function () {
    testEquiv( [ [ 1, 2, 3 ] ], [ 1, 2, 3 ] )
  })

  it('works', function () {
    testEqual(
      [
        {
          '/foo/bar/': 4,
          'bar':3,
        }
      ],
      {
        foo: {
          bar: 4
        },
        bar: 3
      }
    )
  })

  it('does inner paths', function () {
    var source = {
      'bar': {
        'bean/bonk/': 5
      },
    }
    var expected = {
      bar: { bean: { bonk: 5 }}
    }

    var result = normalize( source )
    assert.deepEqual( result, expected )
  })

  it('similar paths', function () {
    var source = {
      'bar/bonk/baz': 6,
      '/bar/bonk/foo/': 5
    }
    var expected = {
      bar: { bonk: { baz: 6, foo: 5 } }
    }

    var result = normalize( source )
    assert.deepEqual( result, expected )
  })

  it('path within paths', function () {
    var source = {
      foo: {
        '/bar/': 5
      }
    }
    var expected = {
      foo: { bar: 5 }
    }

    var result = normalize( source )
    assert.deepEqual( result, expected )
  })

  it('passes simple values unaltered', function () {
    var source = {
      foo: {
        '/bar/': 5
      }
    }
    var expected = {
      foo: { bar: 5 }
    }

    var result = normalize( source )
    assert.deepEqual( result, expected )
  })

})
