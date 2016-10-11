## Paths

**Horten** pathes are lists of **keys** which allow deep access to objects.

### Example
``` js
const value = {
  foo: {
    bar: {
      baz: 42
    }
  }
}

const result = H.get( value, 'foo/bar/baz/' )

assert.equal( result, 42 )
```

For various historical reasons, the canonical `String` representation of paths
is delimited by `'/'` with a trailing slash. Deal with it.


## Mutant

**Mutants** are Horten's method for encapsulating mutable object operations, while
maintaining immutability of inputs and outputs. For example:

``` js
  const value = { foo: 'bar', baz: 'bop' }
      , mutant = H.Mutant( value )

  mutant.set( 42, 'foo' )

  assert.deepEqual( mutant.get(), { foo: 42, baz: 'bop' } )

```

## Echo

**Echo** objects are used to control echoing of change between Horten systems.
