If you'd prefer to dive right in to creating interactive applications with `Horten`, see the [horten-server](https://github.com/koopoer/horten-server) module. It provides pretty, easy, realtime controls, persistence,

# Traits

- Horten is **global by default**. On initialization, the global variable `H` is created. The property `H.root` contains a reference to a default global `Mutant`. This root is used by default by all new `Cursor` objects.  
- Horten is **schema-less**.
- Results are **immutable**.
- Horten uses **js events**.
- Horten uses **traditional OOP**. That is, it makes liberal use of ES6 inheritance, getters, setters and statefulness of objects.

# Docs

## Paths

**Horten** paths are lists of **keys** which allow deep access to objects. They may be represented as either an `Array` or a `String`.

Most methods which accept paths will accept paths as multiple arguments. For instance, the follow calls are all equivalent:

``` js
H.root.walk( 'foo/bar/' )
H.root.walk( 'foo', 'bar' )
H.root.walk( '/foo/', '/bar//' )
H.root.walk( [ 'foo', 'bar' ] )
H.root.walk( [ '/foo/bar/' ] )
```

### Example
``` js
var value = {
  foo: {
    bar: {
      baz: 42
    }
  }
}

var result = H.get( value, 'foo/bar/baz/' )
assert.equal( result, 42 )
```

For various historical and practical reasons, the canonical `String` representation of paths is delimited by `'/'` with a trailing slash. Deal with it.

## Mutants

**Mutants** are Horten's method for encapsulating mutable object operations, while maintaining immutability of inputs and outputs. For example:

``` js
const initialValue = { foo: 'bar', baz: 'bop' }
    , mutant = new H.Mutant( initialValue )

assert.equal( mutant.get(), initialValue )
assert.equal( mutant.get('foo'), 'bar' )

mutant.set( 42, 'foo' )

assert.deepEqual( mutant.get(), { foo: 42, baz: 'bop' } )

assert.notEqual( mutant.get(), initialValue )
```

### Structure

When **Mutants** are used to store non-primitive data, they are organized into a static tree structure. Each `Mutant` has any number of *submutants*, keyed by path segments. Submutants will be created automatically, and are never destroyed.

When a submutant is mutated, its parent will be mutated, and vice-versa.

``` js
const root = new H.Mutant()
    , sub = root.walk('foo')

// `sub` is a submutant of `root` at the path 'foo/'
assert.equal( sub.key, 'foo' )
assert.equal( sub.parent, root )

// Since we didn't specify an initial value for `root`,
// the value of `sub` is undefined.
assert.equal( sub.get(), undefined )

// We can set the value of `sub` directly, and the
// change will propagate to `root`.
sub.set( 'bar' )
assert.deepEqual( root.get(), { foo: 'bar' } )

// If the value of `root` is set, `sub` will be set as well.
root.set( { foo: 'qux' } )
assert.equal( sub.get(), 'qux' )
```

## Cursors

**Cursors** are.


## Events

- `change()` : The value of the object has changed.  
- `value( value )` : The new value of the object.  
- `delta( delta )` : The [delta](#deltas) between the object's previous value and its new one.
