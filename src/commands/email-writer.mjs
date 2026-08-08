import 'zx/globals'
import { aiRequest, getInput, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

const usage = 'zaid email-writer "<notes or draft>" [--model <name>] [--temperature <n>] [--json]'

export const command = 'email-writer [text..]'
export const describe = 'Compose a formal email from notes or a rough draft.'

export function builder (yargs) {
  return yargs
    .usage(`Usage:\n  ${usage}`)
    .positional('text', { type: 'string', describe: 'Notes or rough draft' })
    .options(commonOptions)
    .example('zaid email-writer "tell client the deadline moved to friday, need their assets by wednesday"', '')
    .example('cat notes.txt | zaid email-writer', '')
    .example('zaid email-writer <<\'EOF\'\n- multi-line notes with "quotes" or $vars are safe here\nEOF', '')
}

export async function handler (argv) {
  const { model, temperature, json } = argv
  const inputPrompt = await getInput(argv, `Usage: ${usage}`)

  const systemPrompt =
        'You are an expert email writer. Transform the given notes, bullet points, or rough draft into a polished, well-written email. ' +
        'Tone: formal and professional, but not stiff or bureaucratic. Match the register appropriate to the input\'s context and audience — whether a colleague, client, vendor, or external party. No slang, no casual phrasing, no emojis, no exclamation marks unless the input explicitly requires them. ' +
        'Structure requirements (mandatory): ' +
        'The email MUST open with exactly "Hi," on its own line, followed by a blank line. ' +
        'The email MUST close with exactly "Regards," on its own line at the end. ' +
        'Do not include a name after "Regards,". Do not add subject lines, headers, or signatures beyond the closing. ' +
        'Body: match the length and detail of the input — do not pad, add filler sentences, or introduce context/pleasantries not implied by the input. A one-sentence input should produce a one-to-two-sentence body, not multiple paragraphs. Preserve the intent and all factual details from the input. Improve clarity, grammar, and flow. Do not invent facts, names, dates, or commitments not present in the input. ' +
        'Output only the email text. No preamble, no explanation, no code fences.'

  const userPrompt = `Write a formal email based on the following notes or draft. Open with "Hi," and close with "Regards,". Output only the email.

${inputPrompt}`

  const result = await aiRequest({
    system: systemPrompt,
    prompt: userPrompt,
    model,
    temperature: temperature ?? 0.2,
    spinnerText: 'Composing...',
    json
  })

  if (json) {
    printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage })
  } else {
    console.log(inputPrompt)
    console.log(chalk.dim('─'.repeat(64)))
    console.log(result)
  }
}
