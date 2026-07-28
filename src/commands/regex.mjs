import 'zx/globals'
import { aiStreamRequest, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid regex "<pattern>" [--model <name>] [--temperature <n>] [--json]'

export const command = 'regex [text..]'
export const describe = 'Explain a regex pattern with valid and invalid match examples.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Regex pattern' })
    .options(commonOptions)
    .example('zaid regex "^\\d{4}-\\d{2}-\\d{2}$"', '')
    .example('zaid regex "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"', '')
}

export async function handler (argv) {
  const { model, temperature, json } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const systemPrompt = `You are a regex expert. For the given regex pattern, respond with exactly three sections:

## Explanation
2-3 sentences. What the pattern matches and how it works. Break down key parts if helpful.

## Valid Examples
5 strings that match the pattern, each with a one-line note explaining why it matches.

## Invalid Examples
5 strings that do NOT match the pattern, each with a one-line note explaining why it fails.

No filler. No extra sections.`

  if (!json) {
    console.log(chalk.bold.cyan(`\n${inputPrompt}\n`))
  }

  const result = await aiStreamRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2, json })

  if (json) {
    printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage })
  }
}
