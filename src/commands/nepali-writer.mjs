import 'zx/globals'
import { aiRequest, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid nepali-writer "<text>" [--model <name>] [--temperature <n>] [--json]'

export const command = 'nepali-writer [text..]'
export const describe = 'Translate text into Nepali (Devanagari script).'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Text to translate' })
    .options(commonOptions)
    .example('zaid nepali-writer "Hello, how are you?"', '')
    .example('zaid nepali-writer "The meeting is scheduled for tomorrow."', '')
}

export async function handler (argv) {
  const { model, temperature, json } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const systemPrompt =
        'You are an expert Nepali writer and translator. ' +
        'Respond strictly and completely in native Nepali written in the Devnagari script (नेपाली भाषा / देवनागरी लिपि). ' +
        'Do not use English, Romanized Nepali, or Latin characters in your output. ' +
        'If a technical term or abbreviation has no standard Nepali equivalent, transliterate it into Devanagari script rather than leaving it in Latin characters. ' +
        'If translating, preserve the tone and style of the source exactly. ' +
        'Output only the Nepali text — no explanations, no labels, no extra commentary.'

  const result = await aiRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2, json })

  if (json) {
    printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage })
  } else {
    console.log(result)
  }
}
