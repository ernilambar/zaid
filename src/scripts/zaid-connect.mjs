#!/usr/bin/env node
import 'zx/globals';
import { spinner } from 'zx';
import { getRawClient, printHelp } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'zaid-connect',
		description: 'Check that the configured endpoint is reachable.',
		usage: 'zaid-connect',
		examples: ['zaid-connect'],
	});
}

const { client, baseURL } = getRawClient();

console.log(`Base URL: ${baseURL}`);
console.log(`Model: ${process.env.ZAID_MODEL || chalk.dim('not set')}`);

try {
	const response = await spinner('Connecting...', () => client.models.list());
	const count = response.data?.length ?? 0;
	console.log(chalk.green(`Connected. ${count} model(s) available.`));
} catch (error) {
	console.log(chalk.red(`zaid-connect: failed to reach ${baseURL}: ${error.message}`));
	process.exit(1);
}
