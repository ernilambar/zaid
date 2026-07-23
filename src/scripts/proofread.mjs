#!/usr/bin/env node
import 'zx/globals';
import { aiRequest, getInput, printJson } from '../lib/ai.mjs';
import { buildCli, commonOptions } from '../lib/cli.mjs';

const usage = 'proofread "<text>" [--model <name>] [--temperature <n>] [--json]';

const argv = buildCli({
	name: 'proofread',
	description: 'Proofread text and return corrected output, preserving format.',
	usage,
	examples: [
		'proofread "Their are many reasons why this is importent."',
		'cat draft.md | proofread',
	],
	options: commonOptions,
});

const { model, temperature, json } = argv;
const inputPrompt = await getInput(argv, `Usage: ${usage}`);

const systemPrompt =
	"You are an expert proofreader. Apply minimal edits: correct grammar, spelling, and punctuation; improve clarity only when necessary. Preserve the author's meaning, point of view, and general structure. Do not recast the text into another genre or rewrite for flow unless a phrase is genuinely unclear. " +
	'Replace any vulgar, offensive, or slang words with professional, polite, or neutral equivalents. Preserve the intended meaning. Do not repeat or echo inappropriate language in your output. ' +
	'Preserve the full input: if the text includes a salutation, sign-off, or other framing, keep it. Do not strip greetings or closings. ' +
	"Preserve the input's format exactly: if the input contains HTML tags, output clean HTML; if it is Markdown (headings, bullet lists, numbered lists, bold, italic, etc.), output Markdown preserving all structural elements; if it is plain text, output plain text. Never introduce HTML tags that are not already present in the original input. " +
	'Tone: must match the original tone.';

const userPrompt = `Proofread the following text with minimal changes. Correct errors and improve clarity only where needed; preserve structure, meaning, and the author's voice and point of view (including first- and second-person usage as written).

Return only the corrected text. Preserve the original format: if the input is plain text, return plain text; if it contains HTML, return clean HTML; if it is Markdown, return Markdown with all headings, bullets, and structure intact. Do not wrap the output in code fences.

${inputPrompt}`;

const result = await aiRequest({
	system: systemPrompt,
	prompt: userPrompt,
	model,
	temperature: temperature ?? 0.2,
	spinnerText: 'Proofreading...',
	json,
});

if (json) {
	printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage });
} else {
	console.log(inputPrompt);
	console.log(chalk.dim('─'.repeat(64)));
	console.log(result);
}
