import { test } from 'node:test'
import assert from 'node:assert'
import { build } from './index.js'
import * as tags from 'common-tags'

test('async rendering', async (t) => {
  const builder = build()

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

  builder.html`
    ${firstChunk}
      ${Promise.resolve('test')}
    ${secondChunk}
  `

  builder.end()

  const chunks = [
    firstChunk,
    'test',
    secondChunk
  ]

  for await (const chunk of builder) {
    assert.strictEqual(chunk, tags.html.apply(null, [[chunks.shift()]]))
  }
  assert.strictEqual(chunks.length, 0)
})
