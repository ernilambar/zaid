import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CLI = fileURLToPath(new URL('../src/index.mjs', import.meta.url))

const SUBCOMMANDS = [
  'ask',
  'shell-cmd',
  'function-info',
  'pr-summary',
  'proofread',
  'email-writer',
  'regex',
  'nepali-writer',
  'summarize',
  'explain-error',
  'man',
  'status'
]

function cleanEnv (overrides = {}) {
  const { ZAID_BASE_URL, ZAID_MODEL, ZAID_API_KEY, ...rest } = process.env
  return { ...rest, ...overrides }
}

function run (args, { input = '', env, cwd } = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
    input,
    env: env ?? cleanEnv(),
    cwd
  })
}

test('top-level help lists every subcommand', () => {
  const result = run(['--help'])
  assert.equal(result.status, 0)
  for (const name of SUBCOMMANDS) {
    assert.match(result.stdout, new RegExp(`zaid ${name}\\b`))
  }
})

test('an unknown top-level command exits with an error', () => {
  const result = run(['bogus-command'])
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Unknown argument/)
})

test('every subcommand --help exits cleanly with usage text', () => {
  for (const name of SUBCOMMANDS) {
    const result = run([name, '--help'])
    assert.equal(result.status, 0, `${name} --help should exit 0`)
    assert.match(result.stdout, /Usage:/)
  }
})

test('status reports a clear JSON error when ZAID_BASE_URL is unset', () => {
  const result = run(['status', '--json'])
  assert.equal(result.status, 1)
  assert.deepEqual(JSON.parse(result.stdout), { error: 'ZAID_BASE_URL is not set.' })
})

test('ask with no argument and no piped stdin prints usage and exits 0', () => {
  const result = run(['ask'])
  assert.equal(result.status, 0)
  assert.match(result.stdout, /Usage: zaid ask/)
})

test('pr-summary rejects a nonexistent diff file before touching the network', () => {
  const result = run(['pr-summary', '/nonexistent/path.diff', '--json'], {
    env: cleanEnv({ ZAID_BASE_URL: 'http://127.0.0.1:9999/v1', ZAID_MODEL: 'x' })
  })
  assert.equal(result.status, 1)
  assert.deepEqual(JSON.parse(result.stdout), { error: 'pr-summary: not a valid file: /nonexistent/path.diff' })
})

test('pr-summary reports no diff found as a JSON error, not silent success', () => {
  const repoDir = mkdtempSync(join(tmpdir(), 'zaid-pr-summary-'))
  try {
    spawnSync('git', ['init', '-q'], { cwd: repoDir })
    const result = run(['pr-summary', '--json'], {
      cwd: repoDir,
      env: cleanEnv({ ZAID_BASE_URL: 'http://127.0.0.1:9999/v1', ZAID_MODEL: 'x' })
    })
    assert.equal(result.status, 1)
    assert.deepEqual(JSON.parse(result.stdout), { error: 'pr-summary: no diff found.' })
  } finally {
    rmSync(repoDir, { recursive: true, force: true })
  }
})

test('pr-summary rejects a nonexistent --base branch before touching the network', () => {
  const repoDir = mkdtempSync(join(tmpdir(), 'zaid-pr-summary-'))
  try {
    spawnSync('git', ['init', '-q'], { cwd: repoDir })
    const result = run(['pr-summary', '--base', 'doesnotexist', '--json'], {
      cwd: repoDir,
      env: cleanEnv({ ZAID_BASE_URL: 'http://127.0.0.1:9999/v1', ZAID_MODEL: 'x' })
    })
    assert.equal(result.status, 1)
    assert.deepEqual(JSON.parse(result.stdout), { error: 'pr-summary: base branch not found: doesnotexist' })
  } finally {
    rmSync(repoDir, { recursive: true, force: true })
  }
})

test('pr-summary errors when an explicit --base shares no history with HEAD', () => {
  const repoDir = mkdtempSync(join(tmpdir(), 'zaid-pr-summary-'))
  try {
    const git = (args) => spawnSync('git', args, { cwd: repoDir })
    git(['init', '-q'])
    git(['config', 'user.email', 't@t.com'])
    git(['config', 'user.name', 't'])
    git(['checkout', '-q', '-b', 'base-branch'])
    git(['commit', '-q', '--allow-empty', '-m', 'on branch a'])
    git(['checkout', '-q', '--orphan', 'unrelated'])
    git(['commit', '-q', '--allow-empty', '-m', 'on branch b'])

    const result = run(['pr-summary', '--base', 'base-branch', '--json'], {
      cwd: repoDir,
      env: cleanEnv({ ZAID_BASE_URL: 'http://127.0.0.1:9999/v1', ZAID_MODEL: 'x' })
    })
    assert.equal(result.status, 1)
    assert.deepEqual(JSON.parse(result.stdout), {
      error: "pr-summary: could not compute merge-base with 'base-branch' (no shared history?)."
    })
  } finally {
    rmSync(repoDir, { recursive: true, force: true })
  }
})

test('summarize fails fast when there is no readable text', () => {
  const result = run(['summarize', '--json'], {
    env: cleanEnv({ ZAID_BASE_URL: 'http://127.0.0.1:9999/v1', ZAID_MODEL: 'x' })
  })
  assert.equal(result.status, 1)
  assert.deepEqual(JSON.parse(result.stdout), { error: 'summarize: no readable text found.' })
})

test('proofread --help documents the --style option with its valid choices', () => {
  const result = run(['proofread', '--help'])
  assert.equal(result.status, 0)
  assert.match(result.stdout, /--style/)
  for (const choice of ['professional', 'formal', 'friendly', 'neutral', 'empathetic', 'assertive']) {
    assert.match(result.stdout, new RegExp(`\\b${choice}\\b`))
  }
})

test('proofread rejects an invalid --style value with a helpful error', () => {
  const result = run(['proofread', 'hello world', '--style', 'flirty'], {
    env: cleanEnv({ ZAID_BASE_URL: 'http://127.0.0.1:9999/v1', ZAID_MODEL: 'x' })
  })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Invalid values/)
  assert.match(result.stderr, /professional.*formal.*friendly.*neutral.*empathetic.*assertive/)
})

test('proofread --style case-sensitive: capitalised style is rejected', () => {
  const result = run(['proofread', 'hello world', '--style', 'Formal'], {
    env: cleanEnv({ ZAID_BASE_URL: 'http://127.0.0.1:9999/v1', ZAID_MODEL: 'x' })
  })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Invalid values/)
})

test('proofread with no argument and no piped stdin prints usage and exits 0 without requiring a style', () => {
  const result = run(['proofread'])
  assert.equal(result.status, 0)
  assert.match(result.stdout, /Usage: zaid proofread/)
})

test('proofread --json does not expose style on the top-level usage error (no input)', () => {
  const result = run(['proofread', '--json'], {
    env: cleanEnv({ ZAID_BASE_URL: 'http://127.0.0.1:9999/v1', ZAID_MODEL: 'x' })
  })
  assert.equal(result.status, 0)
  const parsed = JSON.parse(result.stdout)
  assert.match(parsed.error, /Usage: zaid proofread/)
})
