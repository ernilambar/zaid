import 'zx/globals'
import { aiRequest, echoInput, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid proofread "<text>" [--style <style>] [--model <name>] [--temperature <n>] [--json]'

const STYLE_INSTRUCTIONS = {
  professional: 'professional and business-appropriate — polished, clear, and suitable for workplace communication',
  formal: 'formal — structured, precise, and respectful with complete sentences and proper conventions',
  friendly: 'friendly and approachable — warm, conversational, and personable',
  neutral: 'neutral and objective — even, unbiased, and matter-of-fact',
  empathetic: 'empathetic and supportive — understanding, compassionate, and considerate of the reader\'s perspective',
  assertive: 'assertive and confident — direct, clear, and self-assured without being aggressive'
}

export const command = 'proofread [text..]'
export const describe = 'Proofread text and return corrected output, preserving format.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Text to proofread' })
    .options({
      ...commonOptions,
      style: { type: 'string', choices: Object.keys(STYLE_INSTRUCTIONS), describe: 'Rewrite in a specific tone while proofreading' }
    })
    .example('zaid proofread "Their are many reasons why this is importent."', '')
    .example('zaid proofread "hey sorry i missed your email" --style formal', '')
    .example('cat draft.md | zaid proofread', '')
}

export async function handler (argv) {
  const { model, temperature, json, style } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const toneLine = style
    ? `Style target: ${style} — rewrite in a ${STYLE_INSTRUCTIONS[style]} tone while preserving meaning.`
    : 'Tone: must match the original tone.'

  const systemPrompt =
        "You are an expert proofreader. Apply minimal edits: correct grammar, spelling, and punctuation; improve clarity only when necessary. Preserve the author's meaning, point of view, and general structure. Do not recast the text into another genre or rewrite for flow unless a phrase is genuinely unclear. " +
        'Replace any vulgar, offensive, or slang words with professional, polite, or neutral equivalents. Preserve the intended meaning. Do not repeat or echo inappropriate language in your output. ' +
        'Preserve the full input: if the text includes a salutation, sign-off, or other framing, keep it. Do not strip greetings or closings. ' +
        "Preserve the input's format exactly: if the input contains HTML tags, output clean HTML; if it is Markdown (headings, bullet lists, numbered lists, bold, italic, etc.), output Markdown preserving all structural elements; if it is plain text, output plain text. Never introduce HTML tags that are not already present in the original input. " +
        toneLine

  const userPrompt = `Proofread the following text with minimal changes. Correct errors and improve clarity only where needed; preserve structure, meaning, and the author's voice and point of view (including first- and second-person usage as written).

Return only the corrected text. Preserve the original format: if the input is plain text, return plain text; if it contains HTML, return clean HTML; if it is Markdown, return Markdown with all headings, bullets, and structure intact. Do not wrap the output in code fences.

${inputPrompt}`

  const result = await aiRequest({
    system: systemPrompt,
    prompt: userPrompt,
    model,
    temperature: temperature ?? 0.2,
    spinnerText: 'Proofreading...',
    json
  })

  if (json) {
    printJson({ input: inputPrompt, style: style || null, output: result.content, model: result.model, usage: result.usage })
  } else {
    echoInput(inputPrompt)
    console.log(result)
  }
}
