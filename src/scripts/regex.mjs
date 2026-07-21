#!/usr/bin/env node
import 'zx/globals';
import { aiStreamRequest, getInput, printHelp } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'regex',
		description: 'Explain a regex pattern with valid and invalid match examples.',
		usage: 'regex "<pattern>" [--model <name>] [--temperature <n>]',
		examples: [
			'regex "^\\d{4}-\\d{2}-\\d{2}$"',
			'regex "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"',
		],
	});
}

const inputPrompt = getInput('Usage: regex "<pattern>" [--model <name>] [--temperature <n>]');
const { model, temperature } = argv;

const systemPrompt = `You are a regex expert. For the given regex pattern, respond with exactly three sections:

## Explanation
2-3 sentences. What the pattern matches and how it works. Break down key parts if helpful.

## Valid Examples
5 strings that match the pattern, each with a one-line note explaining why it matches.

## Invalid Examples
5 strings that do NOT match the pattern, each with a one-line note explaining why it fails.

No filler. No extra sections.`;

console.log(chalk.bold.cyan(`\n${inputPrompt}\n`));
await aiStreamRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature });
