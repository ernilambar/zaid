import 'zx/globals'
import { aiStreamRequest, echoInput, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid ask "<question>" [--system "<prompt>"] [--model <name>] [--temperature <n>] [--json]'

export const command = 'ask [text..]'
export const describe = 'Ask a general question and get an AI response.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Question to ask' })
    .options({
      ...commonOptions,
      system: { type: 'string', describe: 'Override the default system prompt' }
    })
    .example('zaid ask "What is the difference between TCP and UDP?"', '')
    .example('zaid ask "Rewrite this sentence formally: hey can u send the file" --system "You are a concise editor."', '')
}

export async function handler (argv) {
  const { model, temperature, system, json } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const defaultSystemPrompt =
        'Answer directly and concisely. No preamble, no filler, no unnecessary hedging. ' +
        'Use short paragraphs or bullet points when it aids clarity. Stay on topic.'

  if (!json) {
    echoInput(inputPrompt)
  }

  const result = await aiStreamRequest({ system: system || defaultSystemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.3, json })

  if (json) {
    printJson({ input: inputPrompt, system: system || null, output: result.content, model: result.model, usage: result.usage })
  }
}
