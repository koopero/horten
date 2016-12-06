const assert = require('chai').assert
describe('flatten', function () {
  const flatten = require('../src/flatten')
  it('works', function () {
    const source = {
      foo: {
        bar: 4
      },
      bar: 3

    }
    const expected = {
      'foo/bar/': 4,
      'bar/':3,
    }

    const result = flatten( source )
    assert.deepEqual( result, expected )
  })

  it('detects circular data', function () {
    const source = {
      foo: {
        bar: 4
      },
      bar: 3

    }
    source.foo.circular = source

    assert.throws( () => flatten( source ) )
  })

})
