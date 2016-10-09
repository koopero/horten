## Mutants

**Mutants** are Horten's method for encapsulating mutable object operations, while
maintaining immutability of inputs and outputs. For example:

``` js
  const value = { foo: 'bar', baz: 'bop' }
      , mutant = H.Mutant( value )

  mutant.set( 42, 'foo' )

  assert.deepEqual( mutant.get(), { foo: 42, baz: 'bop' } )

```

## Deltas

**Deltas** 
