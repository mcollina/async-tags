import * as tags from 'common-tags'
import { Readable } from 'node:stream'
import { once } from 'node:events'

function render (strings, ...values) {
  let endReached = false
  const stream = new Readable({
    objectMode: true,
    read () {
      stream.emit('readCalled')
    }
  })

  ;(async function () {
    try {
      for (let i = 0; i < strings.length; i++) {
        const string = strings[i]
        let value = values[i]
        if (typeof value?.then === 'function') {
          value = await value
        }
        if (value && value[Symbol.asyncIterator]) {
          const res = tags.html.apply(null, [[string, ''], ''])
          if (res) {
            stream.push(res)
          }
          for await (const chunk of value) {
            if (!stream.push(chunk)) {
              await once(stream, 'readCalled')
            }
          }
        } else {
          const res = tags.html.apply(null, [[string, ''], value])
          if (res) {
            stream.push(res)
          }
        }
      }

      stream.push(null)
    } catch (err) {
      stream.destroy(err)
    }
  })()

  return stream
}

export { render }
