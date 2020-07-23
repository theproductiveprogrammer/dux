# DUX

Dux is a simpler and more performant version of [Redux](https://redux.js.org). It is simpler to use than [Redux](https://redux.js.org) and easier to understand and tweak.

![dux icon](./dux.jpg)

## Usage

```javascript
const store = dux.createStore(reducer, initialState)
store.get('field', value => {
  // is called evertime field is updated
})
store.get('path.from.0.root.to.field', value => {})
store.get(['multiple', 'fields'], [value, value] => {})
```



