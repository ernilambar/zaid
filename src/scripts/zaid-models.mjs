#!/usr/bin/env node
import 'zx/globals';
import { getRawClient, printJson } from '../lib/ai.mjs';
import { buildCli, commonOptions } from '../lib/cli.mjs';

const argv = buildCli({
	name: 'zaid-models',
	description: 'List models available from the configured endpoint.',
	usage: 'zaid-models [--json]',
	examples: ['zaid-models'],
	options: { json: commonOptions.json },
});

const { json } = argv;
const { client } = getRawClient(json);

try {
	const response = await client.models.list();
	const models = response.data ?? [];

	if (!models.length) {
		if (json) {
			printJson({ models: [] });
		} else {
			console.log(chalk.yellow('No models found.'));
		}
		process.exit(0);
	}

	if (json) {
		printJson({ models: models.map((m) => m.id) });
	} else {
		for (const model of models) {
			console.log(model.id);
		}
	}
} catch (error) {
	if (json) {
		printJson({ error: error.message });
	} else {
		console.log(chalk.red(`zaid-models: failed to list models: ${error.message}`));
	}
	process.exit(1);
}
