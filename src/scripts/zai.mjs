#!/usr/bin/env node
import 'zx/globals';
import { aiStreamRequest, getInput, printJson } from '../lib/ai.mjs';
import { buildCli, commonOptions } from '../lib/cli.mjs';

const usage = 'zai "<question>" [--system "<prompt>"] [--model <name>] [--temperature <n>] [--json]';

const argv = buildCli({
	name: 'zai',
	description: 'Ask a general question and get an AI response.',
	usage,
	examples: [
		'zai "What is the difference between TCP and UDP?"',
		'zai "Rewrite this sentence formally: hey can u send the file" --system "You are a concise editor."',
	],
	options: {
		...commonOptions,
		system: { type: 'string', describe: 'Override the default system prompt' },
	},
});

const { model, temperature, system, json } = argv;
const inputPrompt = await getInput(argv, `Usage: ${usage}`);

const defaultSystemPrompt =
	'Answer directly and concisely. No preamble, no filler, no unnecessary hedging. ' +
	'Use short paragraphs or bullet points when it aids clarity. Stay on topic.';

if (!json) {
	console.log(chalk.bold.cyan(`\n${inputPrompt}\n`));
}

const result = await aiStreamRequest({ system: system || defaultSystemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.3, json });

if (json) {
	printJson({ input: inputPrompt, system: system || null, output: result.content, model: result.model, usage: result.usage });
}
