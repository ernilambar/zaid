#!/usr/bin/env node
import 'zx/globals';
import { aiStreamRequest, getInput, printHelp, printJson } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'zai',
		description: 'Ask a general question and get an AI response.',
		usage: 'zai "<question>" [--system "<prompt>"] [--model <name>] [--temperature <n>] [--json]',
		examples: [
			'zai "What is the difference between TCP and UDP?"',
			'zai "Rewrite this sentence formally: hey can u send the file" --system "You are a concise editor."',
		],
	});
}

const { model, temperature, system, json } = argv;
const inputPrompt = await getInput('Usage: zai "<question>" [--system "<prompt>"] [--model <name>] [--temperature <n>] [--json]', json);

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
