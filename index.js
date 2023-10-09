import * as tags from 'common-tags'

class Renderer {
  #strings
  #values
  #position
  #currentIterator

  constructor (strings, values) {
    this.#strings = strings
    this.#values = values
    this.#position = 0
    this.#currentIterator = null
  }

  async next () {
    if (this.#currentIterator !== null) {
      const { value, done } = await this.#currentIterator.next()
      if (done) {
        this.#currentIterator = null
      }
      if (value) {
        return { value, done: false }
      }
      // TODO handle an edge case where value: undefined and done: false
    }

    if (this.#position === this.#strings.length) {
      return { value: undefined, done: true }
    }

    const string = this.#strings[this.#position]
    let value = this.#values[this.#position]
    this.#position++

    if (typeof value?.then === 'function') {
      value = await value
    }
    if (value && value[Symbol.asyncIterator]) {
      this.#currentIterator = value[Symbol.asyncIterator]()

      const res = tags.html.apply(null, [[string, ''], ''])
      if (res) {
        return { value: res, done: false }
      }

      return this.next()
    } else {
      const res = tags.html.apply(null, [[string, ''], value])
      if (res) {
        return { value: res, done: false }
      }
      return this.next()
    }
  }

  [Symbol.asyncIterator] () {
    return this
  }
}

function render (strings, ...values) {
  // We must ensure that none of the promises are fire and forget.
  // We are forking the promise chain on purpose.
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    if (typeof value?.catch === 'function') {
      value.catch(nop)
    }
  }

  return new Renderer(strings, values)
}

function nop () {}

export { render }
