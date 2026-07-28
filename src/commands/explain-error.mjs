import 'zx/globals'
import { aiRequest, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid explain-error "<error output>" [--model <name>] [--temperature <n>] [--json]'

export const command = 'explain-error [text..]'
export const describe = 'Analyze error output and get a concise explanation with a fix.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Error output' })
    .options(commonOptions)
    .example('zaid explain-error "npm ERR! code ENOENT"', '')
    .example('zaid explain-error "$(cat error.log)"', '')
}

export async function handler (argv) {
  const { model, temperature, json } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const systemPrompt =
        'You are an expert CLI troubleshooting assistant. Analyze the error output and respond with: ' +
        'one sentence explaining what the error is and why it occurred, followed by a concise, copy-pasteable fix.'

  const userPrompt = `Error output:\n${inputPrompt}`

  const result = await aiRequest({
    system: systemPrompt,
    prompt: userPrompt,
    model,
    temperature: temperature ?? 0.1,
    spinnerText: 'Analysing...',
    json
  })

  if (json) {
    printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage })
  } else {
    console.log(result)
  }
}
