# DUX

Dux is a simpler and more performant version of [Redux](https://redux.js.org). It is simpler to use than [Redux](https://redux.js.org) and easier to understand and tweak.

![dux icon](./dux.jpg)

## Usage

```javascript
/*** Creation ***/
const store = dux.createStore(reducer, initialState)

/*** Getting state values ***/
/* Reacts to state changes to always get current value */
store.get('field', value => {
  // function is called every time field is updated
})
// Getting deep fields
store.get('path.from.0.root.to.field', value => {})
// Getting multiple fields
store.get(['multiple', 'fields'], [value, value] => {})

/*** Actions to change state ***/
/* Invokes the reducer and the correct 'get' functions */
store.act(type, payload)
```



