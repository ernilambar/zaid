#!/usr/bin/env node
import 'zx/globals';
import { getRawClient, printHelp } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'zaid-models',
		description: 'List models available from the configured endpoint.',
		usage: 'zaid-models',
		examples: ['zaid-models'],
	});
}

const { client } = getRawClient();

try {
	const response = await client.models.list();
	const models = response.data ?? [];

	if (!models.length) {
		console.log(chalk.yellow('No models found.'));
		process.exit(0);
	}

	for (const model of models) {
		console.log(model.id);
	}
} catch (error) {
	console.log(chalk.red(`zaid-models: failed to list models: ${error.message}`));
	process.exit(1);
}
