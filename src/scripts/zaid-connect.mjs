#!/usr/bin/env node
import 'zx/globals';
import { spinner } from 'zx';
import { getRawClient, printJson } from '../lib/ai.mjs';
import { buildCli, commonOptions } from '../lib/cli.mjs';

const argv = buildCli({
	name: 'zaid-connect',
	description: 'Check that the configured endpoint is reachable.',
	usage: 'zaid-connect [--json]',
	examples: ['zaid-connect'],
	options: { json: commonOptions.json },
});

const { json } = argv;
const { client, baseURL } = getRawClient(json);

if (!json) {
	console.log(`Base URL: ${baseURL}`);
	console.log(`Model: ${process.env.ZAID_MODEL || chalk.dim('not set')}`);
}

try {
	const response = json ? await client.models.list() : await spinner('Connecting...', () => client.models.list());
	const count = response.data?.length ?? 0;

	if (json) {
		printJson({ base_url: baseURL, model: process.env.ZAID_MODEL || null, connected: true, model_count: count });
	} else {
		console.log(chalk.green(`Connected. ${count} model(s) available.`));
	}
} catch (error) {
	if (json) {
		printJson({ base_url: baseURL, model: process.env.ZAID_MODEL || null, connected: false, error: error.message });
	} else {
		console.log(chalk.red(`zaid-connect: failed to reach ${baseURL}: ${error.message}`));
	}
	process.exit(1);
}
