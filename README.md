# DUX

Dux is a simpler and more performant version of [Redux](https://redux.js.org). It is simpler to use than [Redux](https://redux.js.org) and easier to understand and tweak.

![dux icon](./dux.jpg)

## Usage

A Dux store has a very simple interface:

1. `get()` gets the current value of a field in the state
2. `act()` sends an action to update the fields in the state
3. `react()` is called whenever a particular field is updated
4. `clear()` is called to remove a reaction

```javascript
/*** Creation ***/
const store = dux.createStore(reducer, initialState)

/*** Getting whole state ***/
let currentstate = store.get()
/*** Reacting to whole state ***/
store.react(() => ....)

/*** Get a particular value ***/
let value = store.get('field')
/*** Getting deep fields ***/
store.get('path.from.0.root.to.field', value => {})

/*** Reacting to only what interests us ***/
store.react('path.from.root.to.field', value => {
  // function is called every time field is updated
})

/*** Removing a reaction ***/
let dynamic = store.react('field', value => ...)
store.clear(dynamic)

/*** Actions to change state ***/
store.act(type, payload)
```

### Example

```javascript
const store = dux.createStore(reducer, {
  counter: 0,
  colors: [
    { color: "blue" },
    { color: "green" },
    { color: "red" },
  ],
  current: 0,
  blocks: [],
})

store.react(() => console.log(store.get()))

let inc = document.getElementById('inc')
inc.onclick = () => store.act('counter/set', store.get('counter') + 1)

let dec = document.getElementById('dec')
dec.onclick = () => store.act('counter/set', store.get('counter') - 1)

let counterDisp = document.getElementById('counter')
store.react('counter', counter => {
  counterDisp.innerText = counter
})

let block = document.getElementById('block')
setBlockColor(store, block)
block.onclick = () => store.act('current/set', store.get('current') + 1)

let blockDisp = document.getElementById('blocks')
store.react('counter', counter => {
  if(counter < 0) return
  let blocks = store.get('blocks')
  if(blocks.length == counter) return
  blocks.slice()
  if(blocks.length > counter) {
    while(counter < blocks.length) {
      let { block, fn } = blocks.pop()
      store.clear(fn)
      blockDisp.removeChild(block)
    }
  } else {
    while(blocks.length < counter) {
      let block = document.createElement('span')
      blockDisp.appendChild(block)
      blocks.push({ block, fn: setBlockColor(store, block) })
    }
  }
  store.act('blocks/set', blocks)
})

function setBlockColor(store, block) {
  block.className = 'block'
  return store.react('current', current => {
    let colors = store.get('colors')
    let color = colors[current % colors.length].color
    block.style.backgroundColor = color
  })
}

function reducer(state, type, payload) {
  return {
    colors: state.colors,
    counter: reduceCounter(state.counter, type, payload),
    current: reduceCurrent(state.current, type, payload),
    blocks: reduceBlocks(state.blocks, type, payload),
  }
}
function reduceCounter(counter, type, payload) {
  switch(type) {
    case 'counter/set': return payload
    default: return counter
  }
}
function reduceCurrent(current, type, payload) {
  switch(type) {
    case 'current/set': return payload
    default: return current
  }
}
function reduceBlocks(current, type, payload) {
  switch(type) {
    case 'blocks/set': return payload
    default: return current
  }
}
```

See the example in action in [sample.html](./sample.html):

