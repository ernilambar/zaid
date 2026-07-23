#!/usr/bin/env node
import 'zx/globals';
import { aiRequest, getInput, printJson } from '../lib/ai.mjs';
import { buildCli, commonOptions } from '../lib/cli.mjs';

const usage = 'shell-cmd "<description>" [--model <name>] [--temperature <n>] [--json]';

const argv = buildCli({
	name: 'shell-cmd',
	description: 'Convert a plain-English description into a shell command.',
	usage,
	examples: [
		'shell-cmd "list all files modified in the last 7 days"',
		'shell-cmd "find duplicate lines in a file"',
	],
	options: commonOptions,
});

const { model, temperature, json } = argv;
const inputPrompt = await getInput(argv, `Usage: ${usage}`);

const systemPrompt =
	'You are a macOS shell command expert. Convert the user description to a single shell command. ' +
	'Return ONLY the command — no explanation, no markdown, no backticks.';

const result = await aiRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2, json });

if (json) {
	printJson({ input: inputPrompt, output: result.content, model: result.model, usage: result.usage });
} else {
	console.log(chalk.cyan(result));
}
