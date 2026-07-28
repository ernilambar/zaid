import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requireBaseUrl, requireAiConfig, printJson } from '../src/lib/ai.mjs'

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
