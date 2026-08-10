import 'zx/globals'
import { aiStreamRequest, requireAiConfig, printJson, fail } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

export const command = 'pr-summary [file]'
export const describe = 'Generate a PR title and summary from a git diff.'

export function builder (yargs) {
  return yargs
    .usage('Usage:\n  zaid pr-summary [path-to-diff-file] [--base <branch>] [--model <name>] [--temperature <n>] [--json]')
    .positional('file', { type: 'string', describe: 'Path to a diff file' })
    .options({
      ...commonOptions,
      base: { type: 'string', describe: 'Base branch to diff against (default: auto-detected from origin/HEAD)' }
    })
    .example('zaid pr-summary', '')
    .example('zaid pr-summary changes.diff', '')
    .example('zaid pr-summary --base develop', '')
}

async function refExists (ref) {
  return !!(await $`git rev-parse --verify --quiet ${ref}`.quiet().catch(() => null))
}

async function autoDetectBase () {
  const symbolicRef = await $`git symbolic-ref refs/remotes/origin/HEAD`.quiet().catch(() => null)
  if (symbolicRef) {
    const ref = symbolicRef.stdout.trim().replace('refs/remotes/', '')
    if (await refExists(ref)) return ref
  }
  for (const candidate of ['origin/main', 'origin/master', 'main', 'master']) {
    if (await refExists(candidate)) return candidate
  }
  return null
}

export async function handler (argv) {
  const { model, temperature, json } = argv

  requireAiConfig(model, json)

  let diffContent
  let base = null
  let compareLabel = null

  const arg = argv.file
  const source = arg || 'git'

  if (arg) {
    let fileValid = false
    try {
      const s = await fs.stat(arg)
      fileValid = s.isFile()
    } catch {}

    if (!fileValid) {
      fail(`pr-summary: not a valid file: ${arg}`, json)
    }

    diffContent = await fs.readFile(arg, 'utf8')
  } else {
    const isGitRepo = await $`git rev-parse --git-dir`.quiet().catch(() => null)
    if (!isGitRepo) {
      fail('pr-summary: not inside a git repository.', json)
    }

    base = argv.base
    const explicitBase = !!base
    if (base) {
      if (!(await refExists(base))) {
        fail(`pr-summary: base branch not found: ${base}`, json)
      }
    } else {
      base = await autoDetectBase()
    }

    diffContent = ''
    let fallbackReason = 'no base branch detected'

    if (base) {
      const mergeBase = await $`git merge-base HEAD ${base}`.quiet().catch(() => null)
      if (mergeBase) {
        diffContent = (await $`git diff ${mergeBase.stdout.trim()}`.quiet()).stdout
        compareLabel = `${base}..HEAD`
      } else if (explicitBase) {
        fail(`pr-summary: could not compute merge-base with '${base}' (no shared history?).`, json)
      } else {
        fallbackReason = `could not compute merge-base with '${base}'`
        base = null
      }
    }

    if (!base) {
      diffContent = (await $`git diff`.quiet()).stdout
      compareLabel = `working-tree (${fallbackReason} — pass --base to diff against a branch)`
    }

    if (!json) {
      console.log(chalk.dim(`Comparing: ${compareLabel}`))
    }
  }

  diffContent = diffContent.trim()

  if (!diffContent) {
    fail('pr-summary: no diff found.', json)
  }

  diffContent = diffContent.slice(0, 12000)

  const systemPrompt = `You are an expert developer. Given a git diff, output a PR description in exactly this format:

# <pull-request-title>

## Summary

- point one
- point two

Rules: title under 60 chars. Each bullet under 14 words — action verb + what changed, nothing else. 4 bullets max. No sub-bullets, no explanations, no preamble, no trailing text.`

  const result = await aiStreamRequest({ system: systemPrompt, prompt: diffContent, model, temperature: temperature ?? 0.4, json })

  if (json) {
    printJson({ input: diffContent, source, base, compare: compareLabel, output: result.content, model: result.model, usage: result.usage })
  }
}
