#!/usr/bin/env node
import 'zx/globals';
import { aiRequest, getInput, printHelp } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'explain-error',
		description: 'Analyze error output and get a concise explanation with a fix.',
		usage: 'explain-error "<error output>" [--model <name>] [--temperature <n>]',
		examples: [
			'explain-error "npm ERR! code ENOENT"',
			'explain-error "$(cat error.log)"',
		],
	});
}

const inputPrompt = await getInput('Usage: explain-error "<error output>" [--model <name>] [--temperature <n>]');
const { model, temperature } = argv;

const systemPrompt =
	'You are an expert CLI troubleshooting assistant. Analyze the error output and respond with: ' +
	'one sentence explaining what the error is and why it occurred, followed by a concise, copy-pasteable fix.';

const userPrompt = `Error output:\n${inputPrompt}`;

const result = await aiRequest({
	system: systemPrompt,
	prompt: userPrompt,
	model,
	temperature: temperature ?? 0.1,
	spinnerText: 'Analysing...',
});
console.log(result);
