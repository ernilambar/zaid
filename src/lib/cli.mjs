import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

export const commonOptions = {
	model: { type: 'string', describe: 'Model name to use for this request' },
	temperature: { type: 'number', describe: 'Sampling temperature (0-2)' },
	json: { type: 'boolean', default: false, describe: 'Print a single-line JSON object instead of formatted output' },
};

export function buildCli({ name, description, usage, examples = [], options = {} }) {
	const cli = yargs(hideBin(process.argv))
		.scriptName(name)
		.usage(`${description}\n\nUsage:\n  ${usage}`)
		.options(options)
		.help('help')
		.alias('help', 'h')
		.version(version)
		.alias('version', 'v')
		.strictOptions()
		.wrap(100);

	for (const example of examples) {
		cli.example(example, '');
	}

	return cli.parse();
}
