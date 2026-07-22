#!/usr/bin/env node
import 'zx/globals';
import { aiRequest, getInput, printHelp, printJson } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'shell-cmd',
		description: 'Convert a plain-English description into a shell command.',
		usage: 'shell-cmd "<description>" [--model <name>] [--temperature <n>] [--json]',
		examples: [
			'shell-cmd "list all files modified in the last 7 days"',
			'shell-cmd "find duplicate lines in a file"',
		],
	});
}

const { model, temperature, json } = argv;
const inputPrompt = await getInput('Usage: shell-cmd "<description>" [--model <name>] [--temperature <n>] [--json]', json);

const systemPrompt =
	'You are a macOS shell command expert. Convert the user description to a single shell command. ' +
	'Return ONLY the command — no explanation, no markdown, no backticks.';

const result = await aiRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2, json });

if (json) {
	printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage });
} else {
	console.log(chalk.cyan(result));
}
