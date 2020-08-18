# DUX

Dux is a simpler and more performant version of [Redux](https://redux.js.org). It is simpler to use than [Redux](https://redux.js.org) and easier to understand and tweak.

![dux icon](./dux.jpg)

## Install

Use [npm](https://npmjs.org) to install [dux](https://www.npmjs.com/package/@tpp/dux):

```sh
$ npm install @tpp/dux
```

In javascript:

```javascript
const dux = require("@tpp/dux")
```

## Usage

A Dux store has a very simple interface:

1. `get()` gets the current value of a field in the state
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
```

## Events and Reducers

While having interfaces to `get()` values and `react()` to changes is good, we still have a problem - how do the values actually get updated?

Conceptually we change the state of the system only in response to something *happening*. In other words the state responds to ‘events’.

Each part of the system can raise events about things that have happened to them and inform the store. The store then invokes the `reducer` function to which contains the logic to injest the event and create a new version of the state. `dux` then notices the updated state values and invokes any reactions.

By convention events raised should be named like this -  `domain/event`. For example:

```javascript
store.event("todo/completed", { id: 73 })
```

## Keeping Code Clean - Forking

Having a “global” state has it’s drawbacks - it’s harder to partition your code cleanly. All the state is available and invariably tendrils of the code will start to couple with what started off as unrelated sub-systems.

To help with this problem, `dux` allows you to “fork” a store:

```javascript
let substore1 = store.fork('field1')
let substore2 = store.fork('field2.field3')
```

These stores now behave exactly like the main store except that their `get()` and `react()` methods respond as if the given sub-field of the state was the entire state.

Forks are also useful in cleaning up state as we will see next.

## Cleaning Reactions

At some point, we will need to remove reactions. Let’s say we are showing a list of items and an item is removed. So we remove the DOM element corresponding to that item. However the ‘reaction’ that pointed to that DOM element still exists and will prevent that element from being garbage collected.

If you have a few elements, of course, you can choose to ignore this small leak. However it is good practice to clean up after yourself and so you can tell `dux` you no longer need that reaction by calling the `unreact()` method.

Another scenario to consider - say you display a “page” of data and want to navigate to another “page”. Instead of simply hiding the first page you may want to completely destroy it. Again you can inform `dux` that any reactions on that page aren’t needed anymore. The best way to do this is to create a `fork` of the store for the page and then simply `destroy` the fork.

In summary to clean reactions you can use:

1. `unreact()` which will remove the reaction, or
2. `fork()`  the store and `destroy()` the fork to remove all reactions associated with it

## Debugging & Tracing

It can be helpful for debugging to see the what exactly has happened step-by-step to get to the current point. To aid in this, `dux` provides a `trace()` function that keeps track of all events and states efficiently until you turn it off:

```javascript
store.trace(true)
...
store.eventlog((err, log) => console.log(log))
// {type: "block/clicked", payload: undefined, state: {…}}
// {type: "dec/clicked", payload: undefined, state: {…}}
// {type: "blocks/updated", payload: Array(7), state: {…}}
// {type: "inc/clicked", payload: undefined, state: {…}}
// {type: "blocks/updated", payload: Array(8), state: {…}}
// {type: "inc/clicked", payload: undefined, state: {…}}
// {type: "blocks/updated", payload: Array(9), state: {…}}
...
store.trace(false)
```

## Samples

```javascript
const store = dux.createStore(reducer, {
  counter: 0,
})

/* dump the entire state on any change */
store.react(() => console.log(store.get()))

/* increment button */
let inc = document.getElementById('inc')
inc.onclick = () => store.event('inc/clicked')

/* decrement button */
let dec = document.getElementById('dec')
dec.onclick = () => store.event('dec/clicked')

/* react to counter changes */
let counterDisp = document.getElementById('counter')
store.react('counter', counter => {
  counterDisp.innerText = counter
})

function reducer(state, type, payload) {
  return {
    counter: reduceCounter(state.counter, type, payload),
  }
}
function reduceCounter(counter, type, payload) {
  switch(type) {
    case 'inc/clicked': return counter + 1
    case 'dec/clicked': return counter - 1
    default: return counter
  }
}
```

You can see this in action along with a little more functionality in:

* [sample.html](./sample.html)
* [sample2.html](./sample2.html) (multi-colors blocks)
* [sample3.html](./sample3.html) (uses `fork()` and can handle millions of blocks)

See [sample3.html](./sample3.html) in action here

![sample3](./sample3.gif)

Note that reacting to a million `DOM` elements takes a little time. However, most of the time is spend in the browser’s rendering and when we resize back down to 5000 elements the page again responds immediately.

----

