import { spinner } from 'zx';
import OpenAI from 'openai';

function getClient(modelOverride) {
	const baseURL = process.env.ZAID_BASE_URL || 'http://localhost:11434/v1';
	const apiKey = process.env.ZAID_API_KEY || 'local-no-key-required';
	const model = modelOverride || process.env.ZAID_MODEL || 'llama3.2';

	const client = new OpenAI({ baseURL, apiKey });
	return { client, model };
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

export async function aiStreamRequest({ system, prompt, model, temperature = 0.3, spinnerText = 'Connecting...' }) {
	const { client, model: resolvedModel } = getClient(model);

	const stream = await spinner(spinnerText, async () => {
		return await client.chat.completions.create({
			model: resolvedModel,
			stream: true,
			temperature,
			messages: [
				...(system ? [{ role: 'system', content: system }] : []),
				{ role: 'user', content: prompt },
			],
		});
	});

	let fullContent = '';

	for await (const chunk of stream) {
		const text = chunk.choices[0]?.delta?.content || '';
		process.stdout.write(text);
		fullContent += text;
	}

	process.stdout.write('\n');
	return fullContent;
}
