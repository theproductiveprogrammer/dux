'use strict'

/*    understand/
 * This is an improved version of the "redux pattern" which
 * is a nice way to manage state for apps.
 * In brief we have an immutable 'state' which is modified
 * by 'actions' - each creating a new 'state' and we have
 * functions that 'react' to the state changes
 */
function createStore(reducer, initialState) {

  let state = initialState
  let reactors = {}
  let forks = []

  /*    way/
   * Use the reducer to update the state
   * and invoke the reactors
   */
  function event(type, payload) {
    let oldstate = state
    state = reducer(state, type, payload)
    invokeReactors(oldstate, state)
    return state
  }

  /*    way/
   * Invoke the reactors for paths that have changed
   * and invoke them for all the forks
   */
  function invokeReactors(oldstate, state) {
    invokeReactors_(oldstate, state, reactors)
    for(let i = 0;i < forks.length;i++) {
      invokeReactors_(oldstate, state, forks[i].reactors)
    }
  }
  function invokeReactors_(oldstate, state, reactors) {
    for(let p in reactors) {
      if(p == '.') react_1(reactors[p], state)
      else {
        let old = get_(oldstate, p)
        let cur = get_(state, p)
        if(old != cur) react_1(reactors[p], cur)
      }
    }

    function react_1(fns, cur) {
      for(let i = 0;i < fns.length;i++) fns[i](cur)
    }
  }

  /*    way/
   * Return the state
   */
  function getState() {
    return state
  }

  /*    way/
   * Return the requested path from the state
   */
  function get(p) {
    if(!p) return state
    return get_(state, p)
  }

  /*    way/
   * Return the requested path from the given object
   */
  function get_(o, p) {
    if(typeof p == 'string') p = p.split('.')
    for(let i = 0;i < p.length;i++) {
      o = o[p[i]]
      if(!o) return o
    }
    return o
  }

  /*    way/
   * Add the given function to react when the path changes.
   * If no path is given (just a function) then add as a the
   * special '.' reactor.
   */
  function react(p, fn) {
    return react_(p, fn, reactors)
  }
  function react_(p, fn, reactors) {
    if(!fn) {
      fn = p
      p = '.'
    }
    let curr = reactors[p]
    if(!curr) {
      curr = []
      reactors[p] = curr
    }
    curr.push(fn)
    fn(get(p))
    return fn
  }

  /*    way/
   * Remove the given reacting function from our list
   * of reactions, removing the path itself if empty
   */
  function unreact(fn) {
    unreact_(fn, reactors)
  }
  function unreact_(fn, reactors) {
    for(let p in reactors) {
      let ndx = reactors[p].indexOf(fn)
      if(ndx != -1) {
        if(reactors[p].length == 1) delete reactors[p]
        else reactors[p].splice(ndx, 1)
      }
    }
    return false
  }


  /*    way/
   * create a sub store that references the main store
   * for everything except reactions so that the whole
   * group of reactions can be cleared in one go.
   */
  function fork() {
    let reactors = {}

    let fork_ = {
      get,
      event,
      eventlog,
      react: (p, fn) => react_(p, fn, reactors),
      unreact,
      fork,
      destroy,
    }

    forks.push({ reactors, fork_ })

    return fork_
  }

  /*    way/
   * removes a sub-store so the entire group of reactions
   * is no longer referenced
   */
  function destroy(fork_) {
    if(!fork_) return
    for(let i = 0;i < forks.length;i++) {
      let curr = forks[i]
      if(curr.fork_ == fork_) {
        forks.splice(i, 1)
      }
    }
  }

  return {
    get,
    event,
    react,
    unreact,
    fork,
    destroy,
    //dbg: () => { return { state, reactors, forks } }
  }
}

const dux = { createStore }

if(typeof module == 'undefined') window.dux = dux
else module.exports = dux
