var assert = require('chai').assert
describe('compose', function () {
  var compose = require('../src/compose')
  it('works', function () {
    var source = {
      '/foo/bar/': 4,
      'bar':3,
    }
    var expected = {
      foo: {
        bar: 4
      },
      bar: 3
    }

    var result = compose( source )
    assert.deepEqual( result, expected )
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

    var result = compose( source )
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

    var result = compose( source )
    assert.deepEqual( result, expected )
  })

  it('merge multiple arguments', function () {
    var result = compose(
      { '/bar/baz': 4 },
      null,
      { 'bar/foo/': 5 }
    )
    var expected = {
      bar: { baz: 4, foo: 5}
    }
    assert.deepEqual( result, expected )
  })
})
