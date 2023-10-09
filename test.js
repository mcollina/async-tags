import { test } from 'node:test'
import assert from 'node:assert'
import { render } from './index.js'
import * as tags from 'common-tags'
import { setImmediate as immediate } from 'node:timers/promises'

test('async rendering', async (t) => {
  const firstChunk = `
  <DOCTYPE html>
  <html>
    <head>
      <title>test</title>
    </head>
    <body>
      <h1>
`

  const secondChunk = `
      </h1>
    </body>
  </html>
  `

  const stream = render`
    ${firstChunk}
      ${Promise.resolve('test')}
    ${secondChunk}
  `

  const chunks = [
    firstChunk,
    'test',
    secondChunk
  ]

  for await (const chunk of stream) {
    assert.strictEqual(chunk, tags.html.apply(null, [[chunks.shift()]]))
  }
  assert.strictEqual(chunks.length, 0)
})

test('nested async rendering', async (t) => {
  const firstChunk = `
  <DOCTYPE html>
  <html>
    <head>
      <title>test</title>
    </head>
    <body>
`

  const secondChunk = `
    </body>
  </html>
  `

  const stream2 = render`
    <h1>
      ${Promise.resolve('test')}
    </h1>
  `

  const stream = render`
    ${firstChunk}
      ${stream2}      
    ${secondChunk}
  `

  const chunks = [
    firstChunk,
    '<h1>\n  test',
    '</h1>',
    secondChunk
  ]

  for await (const chunk of stream) {
    assert.strictEqual(chunk, tags.html.apply(null, [[chunks.shift()]]))
  }
  assert.strictEqual(chunks.length, 0)
})

test('layouts', async () => {
  function layout1 (next) {
    return render`
      <DOCTYPE html>
      <html>
        <head>
          <title>test</title>
        </head>
        <body>
        ${next}
        </body>
      </html>
    `
  }

  // Async function on purpose
  async function h1 (text) {
    return render`<h1>${text}</h1>`
  }

  const stream = layout1(h1(Promise.resolve('hello')))

  const firstChunk = `
  <DOCTYPE html>
  <html>
    <head>
      <title>test</title>
    </head>
    <body>
`

  const secondChunk = `
    </body>
  </html>
  `

  const chunks = [
    firstChunk,
    '<h1>hello',
    '</h1>',
    secondChunk
  ]

  for await (const chunk of stream) {
    assert.strictEqual(chunk, tags.html.apply(null, [[chunks.shift()]]))
  }
  assert.strictEqual(chunks.length, 0)
})

test('errors in layouts', async () => {
  function layout1 (next) {
    return render`
      <DOCTYPE html>
      <html>
        <head>
          <title>test</title>
        </head>
        <body>
        ${next}
        </body>
      </html>
    `
  }

  // Async function on purpose
  async function h1 (text) {
    return render`<h1>${text}</h1>`
  }

  const stream = layout1(h1(Promise.reject(new Error('kaboom'))))

  await immediate()

  await assert.rejects((async () => {
    for await (const chunk of stream) {
    }
  })())
})
