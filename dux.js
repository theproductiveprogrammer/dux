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
  let toplevel = []
  let forks = []

  /*    way/
   * Use the reducer to update the state
   * and invoke the reactors
   */
  function act(type, payload) {
    let oldstate = state
    state = reducer(state, type, payload)
    invokeReactors(oldstate, state)
    return state
  }

  /*    way/
   * Invoke the reactors for paths that have changed
   * and all top-level reactors
   */
  function invokeReactors(oldstate, state) {
    for(let p in reactors) {
      let old = get_(oldstate, p)
      let cur = get_(state, p)
      if(old != cur) {
        let fns = reactors[p]
        for(let i = 0;i < fns.length;i++) fns[i](cur)
      }
    }
    for(let i = 0;i < toplevel.length;i++) toplevel[i]()
    for(let i = 0;i < forks.length;i++) forks[i].invokeReactors(oldstate, state)
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
   * If no path is given (just a function) then add as a
   * top-level reactor
   */
  function react(p, fn) {
    if(!fn) {
      toplevel.push(p)
      return p
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
    let ndx = toplevel.indexOf(fn)
    if(ndx != -1) {
      toplevel.splice(ndx, 1)
      return true
    }
    for(let p in reactors) {
      let ndx = reactors[p].indexOf(fn)
      if(ndx != -1) {
        if(reactors[p].length == 1) delete reactors[p]
        else reactors[p].splice(ndx, 1)
      }
    }
    return false
  }


  function fork() {
    let reactors = {}
    let toplevel = []

    function react(p, fn) {
      if(!fn) {
        toplevel.push(p)
        return p
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

    function unreact(fn) {
      let ndx = toplevel.indexOf(fn)
      if(ndx != -1) {
        toplevel.splice(ndx, 1)
        return true
      }
      for(let p in reactors) {
        let ndx = reactors[p].indexOf(fn)
        if(ndx != -1) {
          if(reactors[p].length == 1) delete reactors[p]
          else reactors[p].splice(ndx, 1)
        }
      }
      return false
    }

    function invokeReactors(oldstate, state) {
      for(let p in reactors) {
        let old = get_(oldstate, p)
        let cur = get_(state, p)
        if(old != cur) {
          let fns = reactors[p]
          for(let i = 0;i < fns.length;i++) fns[i](cur)
        }
      }
      for(let i = 0;i < toplevel.length;i++) toplevel[i]()
    }

    let fork_ = {
      get,
      act,
      react,
      unreact,
      invokeReactors,
    }

    forks.push(fork_)

    return fork_
  }

  function destroy(fork_) {
    if(!fork_) return
    let ndx = forks.indexOf(fork_)
    if(ndx == -1) throw "Failed to find fork"
    forks.splice(ndx, 1)
  }

  return {
    get,
    act,
    react,
    unreact,
    fork,
    destroy,
    //dbg: () => { return { state, toplevel, reactors, forks } }
  }
}

const dux = { createStore }

if(typeof module == 'undefined') window.dux = dux
else module.exports = dux
