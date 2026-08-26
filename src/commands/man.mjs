import 'zx/globals'
import { aiStreamRequest, echoInput, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid man "<command>" [--model <name>] [--temperature <n>] [--json]'

export const command = 'man [text..]'
export const describe = 'Explain a shell command and its common flags.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Shell command to explain' })
    .options(commonOptions)
    .example('zaid man "git log"', '')
    .example('zaid man "tar -czf"', '')
}

export async function handler (argv) {
  const { model, temperature, json } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const systemPrompt =
    'You are an expert Unix/Linux and macOS shell tutor. The user gives a command, optionally with a subcommand or flags. ' +
    'Explain exactly that command using this structure:\n\n' +
    '## Overview\n1-2 sentences on what it does.\n\n' +
    '## Syntax\n<command> [options] <args>\n\n' +
    '## Options\n- `-x, --xxx`: one-line description. List only the 5-10 most useful flags.\n\n' +
    '## Examples\n2-4 realistic, copy-pasteable examples, each with a one-line explanation.\n\n' +
    'If the name is not a real shell command, do not guess. Instead respond with:\n\n' +
    '## Suggestions\nOne sentence stating it was not found, then 3-5 real, similar commands with a one-line description each.\n\n' +
    'No preamble, no extra sections. Code in fenced blocks.'

  if (!json) {
    echoInput(inputPrompt)
  }

  const result = await aiStreamRequest({
    system: systemPrompt,
    prompt: inputPrompt,
    model,
    temperature: temperature ?? 0.2,
    spinnerText: 'Looking up...',
    json
  })

  if (json) {
    printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage })
  }
}
