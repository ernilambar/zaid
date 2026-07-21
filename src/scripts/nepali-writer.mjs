#!/usr/bin/env zx

import { aiRequest } from '../lib/ai.mjs';

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

const result = await aiRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature });
console.log(result);
