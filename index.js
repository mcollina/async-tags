import * as tags from 'common-tags'
import { Readable } from 'node:stream'

function build () {
  let endReached = false
  const stream = new Readable({
    objectMode: true,
    read () {}
  })

  function html (strings, ...values) {
    ;(async function () {

      for (let i = 0; i < strings.length; i++) {
        const string = strings[i]
        let value = values[i]
        if (typeof value?.then === 'function') {
          value = await value
        }
        const res = tags.html.apply(null, [[string, ''], value])
        if (res) {
          stream.push(res)
        }
      }

      if (endReached) {
        stream.push(null)
      }
    })()
  }

  stream.html = html

  stream.end = () => {
    endReached = true
  }

  return stream
}

export { build }
