import 'zx/globals'
import { aiRequest, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid regex "<description>" [--model <name>] [--temperature <n>] [--json]'

export const command = 'regex [text..]'
export const describe = 'Convert a plain-English description into a regex pattern.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Description of the pattern to match' })
    .options(commonOptions)
    .example('zaid regex "a date in YYYY-MM-DD format"', '')
    .example('zaid regex "a valid email address"', '')
}

export async function handler (argv) {
  const { model, temperature, json } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const systemPrompt =
        'You are a regex expert. Convert the user description into a regex pattern. ' +
        'Respond with exactly two lines: the regex pattern on the first line, then a one-line note ' +
        'explaining what it matches. No markdown, no backticks, no extra sections.'

  const result = await aiRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2, json })

  if (json) {
    printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage })
  } else {
    console.log(result)
  }
}
