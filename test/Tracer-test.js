const test = require('./_test')
    , assert = test.assert

const Mutant = require('../src/Mutant')

describe('Tracer', () => {
  const Tracer = require('../src/Tracer')
  it('will trace', ( cb ) => {
    const root = new Mutant()
        , path = test.path()
        , tracer = new Tracer( {
          root: root,
          path: path,
          listening: true,
          name: 'test-tracer'
        })

    root.patch( test.data(), path )
    root.patch( test.data(), path )
    root.patch( test.data(), path )

    cb()
  })
})
