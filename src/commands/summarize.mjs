import 'zx/globals'
import { spinner } from 'zx'
import { parseHTML } from 'linkedom'
import { Readability } from '@mozilla/readability'
import { aiStreamRequest, requireAiConfig, printJson, fail } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

export const command = 'summarize [text..]'
export const describe = 'Summarize a URL, local text file, or direct text as bullet points.'

export function builder (yargs) {
  return yargs
    .usage('Usage:\n  zaid summarize <url|file|"text"> [--model <name>] [--temperature <n>] [--json]')
    .positional('text', { type: 'string', describe: 'URL, file path, or direct text' })
    .options(commonOptions)
    .example('zaid summarize https://example.com/article', '')
    .example('zaid summarize notes.txt', '')
    .example('zaid summarize "paste your text here"', '')
}

export async function handler (argv) {
  const { model, temperature, json } = argv

  requireAiConfig(model, json)

  const positional = argv.text || []
  const single = positional.length === 1 ? positional[0] : null

  let text
  let source

  if (single && /^https?:\/\//i.test(single)) {
    source = single
    let html
    try {
      const fetchHtml = async () => {
        const response = await fetch(single)
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`)
        }
        return await response.text()
      }
      html = json ? await fetchHtml() : await spinner('Fetching...', fetchHtml)
    } catch (error) {
      fail(`summarize: failed to fetch: ${error.message}`, json)
    }

    const { document } = parseHTML(html)
    const article = new Readability(document).parse()
    text = article?.textContent || ''
  } else {
    let fileValid = false

    if (single) {
      try {
        const s = await fs.stat(single)
        fileValid = s.isFile()
      } catch {}
    }

    if (fileValid) {
      source = single
      text = await fs.readFile(single, 'utf8')
    } else {
      source = 'text'
      text = positional.join(' ')
    }
  }

  text = text.trim().slice(0, 8000)

  if (!text) {
    fail('summarize: no readable text found.', json)
  }

  const systemPrompt =
        'Summarize the following content. First line: a short title (3-6 words, no punctuation, no "Summary:" prefix). ' +
        'Blank line. Then up to 8 concise bullet points, one per distinct key point actually present in the source. ' +
        'Use fewer bullets for short or simple content — never pad, repeat, or split a single point just to fill a quota. ' +
        'Be specific — avoid vague or generic statements. No preamble, no other text.'

  const result = await aiStreamRequest({
    system: systemPrompt,
    prompt: text,
    model,
    temperature: temperature ?? 0.3,
    spinnerText: 'Summarising...',
    json
  })

  if (json) {
    printJson({ input: text, source, output: result.content, model: result.model, usage: result.usage })
  }
}
