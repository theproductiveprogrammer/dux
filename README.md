# DUX

Dux is a simpler and more performant version of [Redux](https://redux.js.org). It is simpler to use than [Redux](https://redux.js.org) and easier to understand and tweak.

![dux icon](./dux.jpg)

## Usage

A Dux store has a very simple interface:

1. `get()` gets the current value of a field in the state
2. `act()` sends an action to update the fields in the state
3. `react()` is called whenever a particular field is updated

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
})

store.react(() => console.log(store.get()))

let inc = document.getElementById('inc')
inc.onclick = () => store.act('counter/set', store.get('counter') + 1)

let counterDisp = document.getElementById('counter')
store.react('counter', counter => {
  counterDisp.innerText = counter
})

let block = document.getElementById('block')
setBlockColor(store, block)
block.onclick = () => store.act('current/set', store.get('current') + 1)

let blocks = document.getElementById('blocks')
let num = 0
store.react('counter', counter => {
  while(num < counter) {
    let block = document.createElement('span')
    blocks.appendChild(block)
    setBlockColor(store, block)
    num++
  }
})

function setBlockColor(store, block) {
  block.className = 'block'
  store.react('current', current => {
    let colors = store.get('colors')
    let color = colors[current % colors.length].color
    block.style.backgroundColor = color
  })
}

function reducer(state, type, payload) {
  return {
    colors: state.colors,
    counter: reduceCounter(state.counter, type, payload),
    current: reduceCurrent(state.current, type, payload)
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
```

See the example in action in [sample.html](./sample.html):

