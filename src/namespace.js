const NS = ( global.H && global.H.NS ) || exports
module.exports = NS

const keys = [
  'isMutant',
  'mutate',
  'mutating',
  'mutation',
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
  'releasing',
  'onSubMutate',
  'parent',
  'value',
  'initial',
  'subs',
  'key',
  'emit',
  'delayMax',
  'firstTrigger'
]

keys.forEach( ( key ) =>
  NS[key] = NS[key] || Symbol( key )
)
