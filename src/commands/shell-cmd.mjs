import 'zx/globals'
import { aiRequest, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid shell-cmd "<description>" [--os <macos|linux|windows>] [--model <name>] [--temperature <n>] [--json]'

const PLATFORM_TO_OS = { darwin: 'macos', linux: 'linux', win32: 'windows' }
const OS_LABELS = { macos: 'macOS', linux: 'Linux', windows: 'Windows' }

function detectOs () {
  return PLATFORM_TO_OS[process.platform] || 'linux'
}

export const command = 'shell-cmd [text..]'
export const describe = 'Convert a plain-English description into a shell command.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Description of the desired command' })
    .options({
      ...commonOptions,
      os: { type: 'string', choices: ['macos', 'linux', 'windows'], describe: 'Target OS for the generated command (default: auto-detected)' }
    })
    .example('zaid shell-cmd "list all files modified in the last 7 days"', '')
    .example('zaid shell-cmd "find duplicate lines in a file"', '')
    .example('zaid shell-cmd "recursively set file permissions to 644" --os linux', '')
}

export async function handler (argv) {
  const { model, temperature, json, os: osOverride } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const targetOs = osOverride || detectOs()
  const osLabel = OS_LABELS[targetOs]

  const systemPrompt =
        `You are a ${osLabel} shell command expert. Convert the user description to a single shell command for ${osLabel}. ` +
        'Return ONLY the command — no explanation, no markdown, no backticks.'

  const result = await aiRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2, json })

  if (json) {
    printJson({ input: inputPrompt, os: targetOs, output: result.content, model: result.model, usage: result.usage })
  } else {
    console.log(chalk.cyan(result))
  }
}
