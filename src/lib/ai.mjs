import { spinner } from 'zx';
import OpenAI from 'openai';

export function printJson(data) {
	console.log(JSON.stringify(data));
}

export function fail(message, json = false) {
	if (json) {
		printJson({ error: message });
	} else {
		console.log(chalk.yellow(message));
	}
	process.exit(1);
}

export function requireAiConfig(modelOverride, json = false) {
	const baseURL = requireBaseUrl(json);

	if (!modelOverride && !process.env.ZAID_MODEL) {
		fail('Model is not set. Pass --model or set ZAID_MODEL.', json);
	}

	return baseURL;
}

export function requireBaseUrl(json = false) {
	const baseURL = process.env.ZAID_BASE_URL;

	if (!baseURL) {
		fail('ZAID_BASE_URL is not set.', json);
	}

	return baseURL;
}

export async function getInput(argv, usage) {
	let text = argv._.join(' ');

	if (!text && !process.stdin.isTTY) {
		const chunks = [];
		for await (const chunk of process.stdin) {
			chunks.push(chunk);
		}
		text = Buffer.concat(chunks).toString('utf8').trim();
	}

	if (!text) {
		if (argv.json) {
			printJson({ error: usage });
		} else {
			console.log(chalk.yellow(usage));
		}
		process.exit(0);
	}

	return text;
}

function getClient(modelOverride, json = false) {
	const baseURL = requireAiConfig(modelOverride, json);
	const apiKey = process.env.ZAID_API_KEY || 'local';
	const model = modelOverride || process.env.ZAID_MODEL;

	const client = new OpenAI({ baseURL, apiKey });
	return { client, model };
}

export function getRawClient(json = false) {
	const baseURL = requireBaseUrl(json);
	const apiKey = process.env.ZAID_API_KEY || 'local';

	const client = new OpenAI({ baseURL, apiKey });
	return { client, baseURL };
}

export async function aiRequest({ system, prompt, model, temperature = 0.3, spinnerText = 'Thinking...', json = false }) {
	const { client, model: resolvedModel } = getClient(model, json);

	const run = async () => {
		const response = await client.chat.completions.create({
			model: resolvedModel,
			stream: false,
			temperature,
			messages: [
				...(system ? [{ role: 'system', content: system }] : []),
				{ role: 'user', content: prompt },
			],
		});

		const content = response.choices[0]?.message?.content?.trim() || '';

		return json ? { content, model: resolvedModel, usage: response.usage ?? null } : content;
	};

	return json ? await run() : await spinner(spinnerText, run);
}

export async function aiStreamRequest({ system, prompt, model, temperature = 0.3, spinnerText = 'Thinking...', json = false }) {
	if (json) {
		return await aiRequest({ system, prompt, model, temperature, json: true });
	}

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
