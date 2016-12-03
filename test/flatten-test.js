var assert = require('chai').assert
describe('flatten', function () {
  var flatten = require('../src/flatten')
  it('works', function () {
    var source = {
      foo: {
        bar: 4
      },
      bar: 3

    }
    var expected = {
      'foo/bar/': 4,
      'bar/':3,
    }

    var result = flatten( source )
    assert.deepEqual( result, expected )
  })

  it('detects circular data', function () {
    var source = {
      foo: {
        bar: 4
      },
      bar: 3

    }
    source.foo.circular = source

    assert.throws( () => flatten( source ) )
  })

})
