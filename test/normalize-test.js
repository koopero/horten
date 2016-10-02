const test = require('./_test')
    , assert = test.assert


describe('normalize', function () {
  const normalize = require('../src/normalize')

  const testEqual = test.wrapEqual( normalize )
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
    const source = {
      'bar': {
        'bean/bonk/': 5
      },
    }
    const expected = {
      bar: { bean: { bonk: 5 }}
    }

    const result = normalize( source )
    assert.deepEqual( result, expected )
  })

  it('similar paths', function () {
    const source = {
      'bar/bonk/baz': 6,
      '/bar/bonk/foo/': 5
    }
    const expected = {
      bar: { bonk: { baz: 6, foo: 5 } }
    }

    const result = normalize( source )
    assert.deepEqual( result, expected )
  })

  it('path within paths', function () {
    const source = {
      foo: {
        '/bar/': 5
      }
    }
    const expected = {
      foo: { bar: 5 }
    }

    const result = normalize( source )
    assert.deepEqual( result, expected )
  })

  it('passes simple values unaltered', function () {
    const source = {
      foo: {
        '/bar/': 5
      }
    }
    const expected = {
      foo: { bar: 5 }
    }

    const result = normalize( source )
    assert.deepEqual( result, expected )
  })

})
