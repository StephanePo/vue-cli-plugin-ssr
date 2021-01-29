export function loadAsyncComponents ({ router }) {
  // Get matched components by route and load them
  const path = getLocation(router.options.base)
  const resolveComponents = flatMapComponents(router.match(path), function (Component, _, match, key, index) {
    if (typeof Component === 'function' && !Component.options) {
      return new Promise(function (resolve, reject) {
        const _resolve = function (Component) {
          Component = Component.default || Component
          match.components[key] = Component
          resolve(Component)
        }
        const res = Component(_resolve, reject)
        if (res && res.then) {
          res.then(_resolve).catch(reject)
        }
      })
    }
    return Component
  })

  return Promise.all(resolveComponents)
    .catch(function (err) {
      console.error('Cannot load components', err)
    })
}

// Imported for vue-router
export function flatMapComponents (route, fn) {
  return Array.prototype.concat.apply([], route.matched.map(function (m, index) {
    return Object.keys(m.components).map(function (key) {
      return fn(m.components[key], m.instances[key], m, key, index)
    })
  }))
}

// Imported from vue-router
export function getLocation (base) {
  let path = window.location.pathname
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}
