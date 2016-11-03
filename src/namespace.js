const NS = ( global.H && global.H.NS ) || exports
module.exports = NS

const keys = [
  'isMutant',
  'mutate',
  'listener',
  'listenerBound',
  'sender',
  'immediate',
  'timeout',
  'root',
  'echo',
  'path',
  'delay',
  'delayTime',
  'delta',
  'mutant',
  'listening',
  'clearTimers',
  'hold',
  'held',
  'releasing'
]

keys.forEach( ( key ) =>
  NS[key] = NS[key] || Symbol( key )
)
