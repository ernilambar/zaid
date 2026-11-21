import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requireBaseUrl, requireAiConfig, printJson, defaultHeaders } from '../src/lib/ai.mjs'

test('requireBaseUrl returns the configured base URL', () => {
  process.env.ZAID_BASE_URL = 'http://example.test/v1'
  assert.equal(requireBaseUrl(), 'http://example.test/v1')
  delete process.env.ZAID_BASE_URL
})

test('requireAiConfig returns the base URL when a model override is passed', () => {
  process.env.ZAID_BASE_URL = 'http://example.test/v1'
  assert.equal(requireAiConfig('some-model'), 'http://example.test/v1')
  delete process.env.ZAID_BASE_URL
})

test('requireAiConfig returns the base URL when ZAID_MODEL is set', () => {
  process.env.ZAID_BASE_URL = 'http://example.test/v1'
  process.env.ZAID_MODEL = 'env-model'
  assert.equal(requireAiConfig(undefined), 'http://example.test/v1')
  delete process.env.ZAID_BASE_URL
  delete process.env.ZAID_MODEL
})

test('defaultHeaders sets an OpenCode session id in the expected shape', () => {
  const session = defaultHeaders()['x-opencode-session']
  assert.match(session, /^ses_[0-9a-f]{32}$/)
})

test('defaultHeaders generates a distinct session id per request', () => {
  assert.notEqual(defaultHeaders()['x-opencode-session'], defaultHeaders()['x-opencode-session'])
})

test('printJson writes compact single-line JSON to stdout', () => {
  const calls = []
  const original = console.log
  console.log = (msg) => calls.push(msg)
  try {
    printJson({ a: 1, b: 'two' })
  } finally {
    console.log = original
  }
  assert.deepEqual(calls, ['{"a":1,"b":"two"}'])
})
