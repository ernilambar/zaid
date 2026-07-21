#!/usr/bin/env zx

const scriptPath = fs.realpathSync(process.argv[2]);
const { aiRequest, getInput, printHelp } = await import(path.join(path.dirname(scriptPath), '../lib/ai.mjs'));

if (argv.help || argv.h) {
	printHelp({
		name: 'shell-cmd',
		description: 'Convert a plain-English description into a shell command.',
		usage: 'shell-cmd "<description>" [--model <name>] [--temperature <n>]',
		examples: [
			'shell-cmd "list all files modified in the last 7 days"',
			'shell-cmd "find duplicate lines in a file"',
		],
	});
}

const inputPrompt = getInput('Usage: shell-cmd "<description>" [--model <name>] [--temperature <n>]');
const { model, temperature } = argv;

const systemPrompt =
	'You are a macOS shell command expert. Convert the user description to a single shell command. ' +
	'Return ONLY the command — no explanation, no markdown, no backticks.';

const result = await aiRequest({ system: systemPrompt, prompt: inputPrompt, model, temperature: temperature ?? 0.2 });
console.log(chalk.cyan(result));
