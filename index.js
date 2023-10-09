import * as tags from 'common-tags'

async function * render (strings, ...values) {
  let endReached = false

  for (let i = 0; i < strings.length; i++) {
    const string = strings[i]
    let value = values[i]
    if (typeof value?.then === 'function') {
      value = await value
    }
    if (value && value[Symbol.asyncIterator]) {
      const res = tags.html.apply(null, [[string, ''], ''])
      if (res) {
        yield res
      }
      for await (const chunk of value) {
        yield chunk
      }
    } else {
      const res = tags.html.apply(null, [[string, ''], value])
      if (res) {
        yield res
      }
    }
  }
}

export { render }
