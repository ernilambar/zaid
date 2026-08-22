import 'zx/globals'
import { aiStreamRequest, echoInput, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid function-info <function-or-hook> [--model <name>] [--temperature <n>] [--json]'

export const command = 'function-info [text..]'
export const describe = 'Explain a PHP function or WordPress hook/action/filter.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'PHP function or WordPress hook/action/filter name' })
    .options(commonOptions)
    .example('zaid function-info array_map', '')
    .example('zaid function-info wp_head', '')
}

export async function handler (argv) {
  const { model, temperature, json } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const systemPrompt = `You are a PHP and WordPress expert. The user will provide a PHP function or WordPress hook/action/filter name. If the name ends with "()" it explicitly refers to the function — do NOT cover the hook variant.

If the name exists only as a function, respond with:

## Intro
2-3 sentences. What it does and when to use it.

## Signature
Function signature with param types and return type.

## Example
Minimal working code with a one-line explanation.

If the name exists only as a hook, respond with:

## Intro
2-3 sentences. What it does and when to use it.

## Example
Minimal working code with a one-line explanation.

If the name exists as BOTH a function and a hook, respond with two separate blocks:

## As a Function
### Intro
### Signature
### Example

## As a Hook
### Intro
### Example

If the name is not a known PHP function or WordPress hook, do not guess or fabricate — instead respond with:

## Suggestions
One sentence stating it was not found, then list 3-5 real, similar PHP functions or WordPress hooks with a one-line description each.

No filler. No extra sections. Code in fenced blocks.`

  if (!json) {
    echoInput(inputPrompt)
  }

  const result = await aiStreamRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2, json })

  if (json) {
    printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage })
  }
}
