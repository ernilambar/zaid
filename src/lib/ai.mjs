import { spinner } from 'zx';
import OpenAI from 'openai';

export function requireAiConfig(modelOverride) {
	const baseURL = requireBaseUrl();

	if (!modelOverride && !process.env.ZAID_MODEL) {
		console.log(chalk.yellow('Model is not set. Pass --model or set ZAID_MODEL.'));
		process.exit(1);
	}

	return baseURL;
}

export function requireBaseUrl() {
	const baseURL = process.env.ZAID_BASE_URL;

	if (!baseURL) {
		console.log(chalk.yellow('ZAID_BASE_URL is not set.'));
		process.exit(1);
	}

	return baseURL;
}

export function printHelp({ name, description, usage, examples }) {
	console.log(`${chalk.bold(name)} — ${description}`);
	console.log('');
	console.log(chalk.bold('Usage:'));
	console.log(`  ${usage}`);
	console.log('');
	console.log(chalk.bold('Examples:'));
	for (const example of examples) {
		console.log(`  ${example}`);
	}
	process.exit(0);
}

export function getInput(usage) {
	const text = argv._.join(' ');

	if (!text) {
		console.log(chalk.yellow(usage));
		process.exit(0);
	}

	return text;
}

function getClient(modelOverride) {
	const baseURL = requireAiConfig(modelOverride);
	const apiKey = process.env.ZAID_API_KEY || 'local';
	const model = modelOverride || process.env.ZAID_MODEL;

	const client = new OpenAI({ baseURL, apiKey });
	return { client, model };
}

export function getRawClient() {
	const baseURL = requireBaseUrl();
	const apiKey = process.env.ZAID_API_KEY || 'local';

	const client = new OpenAI({ baseURL, apiKey });
	return { client, baseURL };
}

export async function aiRequest({ system, prompt, model, temperature = 0.3, spinnerText = 'Thinking...' }) {
	const { client, model: resolvedModel } = getClient(model);

	return await spinner(spinnerText, async () => {
		const response = await client.chat.completions.create({
			model: resolvedModel,
			stream: false,
			temperature,
			messages: [
				...(system ? [{ role: 'system', content: system }] : []),
				{ role: 'user', content: prompt },
			],
		});

		return response.choices[0]?.message?.content?.trim() || '';
	});
}

export async function aiStreamRequest({ system, prompt, model, temperature = 0.3, spinnerText = 'Thinking...' }) {
	const { client, model: resolvedModel } = getClient(model);

	const { iterator, first } = await spinner(spinnerText, async () => {
		const stream = await client.chat.completions.create({
			model: resolvedModel,
			stream: true,
			temperature,
			messages: [
				...(system ? [{ role: 'system', content: system }] : []),
				{ role: 'user', content: prompt },
			],
		});

		const iterator = stream[Symbol.asyncIterator]();

		let result = await iterator.next();
		while (!result.done && !result.value.choices[0]?.delta?.content) {
			result = await iterator.next();
		}

		return { iterator, first: result };
	});

	let fullContent = '';

	const write = (chunk) => {
		const text = chunk.choices[0]?.delta?.content || '';
		process.stdout.write(text);
		fullContent += text;
	};

	let result = first;
	while (!result.done) {
		write(result.value);
		result = await iterator.next();
	}

	process.stdout.write('\n');
	return fullContent;
}
