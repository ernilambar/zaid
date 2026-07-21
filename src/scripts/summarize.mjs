#!/usr/bin/env node
import 'zx/globals';
import { spinner } from 'zx';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { aiStreamRequest, requireAiConfig, printHelp } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'summarize',
		description: 'Summarize a URL, local text file, or direct text as bullet points.',
		usage: 'summarize <url|file|"text"> [--model <name>] [--temperature <n>]',
		examples: [
			'summarize https://example.com/article',
			'summarize notes.txt',
			'summarize "paste your text here"',
		],
	});
}

const { model, temperature } = argv;

requireAiConfig(model);

const single = argv._.length === 1 ? argv._[0] : null;

let text;
let label;

if (single && /^https?:\/\//i.test(single)) {
	label = single;

	let html;
	try {
		html = await spinner('Fetching...', async () => {
			const response = await fetch(single);
			if (!response.ok) {
				throw new Error(`${response.status} ${response.statusText}`);
			}
			return await response.text();
		});
	} catch (error) {
		console.log(chalk.yellow(`summarize: failed to fetch: ${error.message}`));
		process.exit(1);
	}

	const dom = new JSDOM(html, { url: single });
	const article = new Readability(dom.window.document).parse();
	text = article?.textContent || '';
} else {
	let fileValid = false;

	if (single) {
		try {
			const s = await fs.stat(single);
			fileValid = s.isFile();
		} catch {}
	}

	if (fileValid) {
		label = single;
		text = await fs.readFile(single, 'utf8');
	} else {
		label = 'direct input';
		text = argv._.join(' ');
	}
}

text = text.trim().slice(0, 12000);

if (!text) {
	console.log(chalk.yellow('summarize: no readable text found.'));
	process.exit(1);
}

const systemPrompt =
	'Summarize the following content as 5-8 concise bullet points. Each bullet should capture one distinct key point. ' +
	'Be specific — avoid vague or generic statements. Do not include any preamble.';

console.log(chalk.bold.cyan(`\n${label}\n`));

await aiStreamRequest({
	system: systemPrompt,
	prompt: text,
	model,
	temperature: temperature ?? 0.3,
	spinnerText: 'Summarising...',
});
