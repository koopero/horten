const Cursor = require('./Cursor')
    , flatten = require('./flatten')
    , eachKey = require('./eachKey')
    , resolve = require('./path').resolve

class Tracer extends Cursor {
  constructor( opt ) {
    super( opt )
    this.on('delta', this.onDelta.bind( this ) )
  }

  configure( opt ) {
    super.configure( opt )
    if ( opt.name )
      this.name = opt.name
  }

  onDelta( delta ) {
    delta = flatten( delta )
    eachKey( delta, ( value, path ) => {
      const columns = []
      if ( this.name )
        columns.push( this.name )

      path = resolve( this.path, path )
      columns.push( path )
      columns.push( value )

      console.log.apply( console, columns )
    })
  }
}

module.exports = Tracer
