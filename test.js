import { test } from 'node:test'
import assert from 'node:assert'
import { render } from './index.js'
import * as tags from 'common-tags'

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
