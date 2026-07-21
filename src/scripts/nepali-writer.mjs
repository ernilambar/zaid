#!/usr/bin/env node
import 'zx/globals';
import { aiRequest, printHelp } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'nepali-writer',
		description: 'Translate text into Nepali (Devanagari script).',
		usage: 'nepali-writer "<text>" [--model <name>] [--temperature <n>]',
		examples: [
			'nepali-writer "Hello, how are you?"',
			'nepali-writer "The meeting is scheduled for tomorrow."',
		],
	});
}

const inputPrompt = argv._.join(' ');
const { model, temperature } = argv;

if (!inputPrompt) {
	console.log(chalk.yellow('Usage: nepali-writer "<text>" [--model <name>] [--temperature <n>]'));
	process.exit(0);
}

const systemPrompt =
	'You are an expert Nepali writer and translator. ' +
	'Respond strictly and completely in native Nepali written in the Devnagari script (नेपाली भाषा / देवनागरी लिपि). ' +
	'Do not use English, Romanized Nepali, or Latin characters in your output. ' +
	'If a technical term or abbreviation has no standard Nepali equivalent, transliterate it into Devanagari script rather than leaving it in Latin characters. ' +
	'If translating, preserve the tone and style of the source exactly. ' +
	'Output only the Nepali text — no explanations, no labels, no extra commentary.';

const result = await aiRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2 });
console.log(result);
