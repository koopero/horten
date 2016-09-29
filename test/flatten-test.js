const assert = require('chai').assert
describe('flatten', function () {
  const flatten = require('../src/flatten')
  it('works', function () {
    const source = {
      '/foo/bar/': 4,
      'bar':3,
    }
    const expected = {
      foo: {
        bar: 4
      },
      bar: 3
    }

    const result = flatten( source )
    assert.deepEqual( result, expected )
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

    const result = flatten( source )
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

    const result = flatten( source )
    assert.deepEqual( result, expected )
  })
})
