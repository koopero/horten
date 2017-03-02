const assert = require('chai').assert
describe('compose', function () {
  const compose = require('../src/compose')
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

    const result = compose( source )
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

    const result = compose( source )
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

    const result = compose( source )
    assert.deepEqual( result, expected )
  })

  it('merge multiple arguments', function () {
    const result = compose(
      { '/bar/baz': 4 },
      // null,
      { 'bar/foo/': 5 }
    )
    const expected = {
      bar: { baz: 4, foo: 5}
    }
    assert.deepEqual( result, expected )
  })
})
