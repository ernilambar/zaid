#!/usr/bin/env node
import 'zx/globals';
import { aiStreamRequest, requireAiConfig, printHelp, printJson, fail } from '../lib/ai.mjs';

if (argv.help || argv.h) {
	printHelp({
		name: 'pr-summary',
		description: 'Generate a PR title and summary from a git diff.',
		usage: 'pr-summary [path-to-diff-file] [--model <name>] [--temperature <n>] [--json]',
		examples: [
			'pr-summary',
			'pr-summary changes.diff',
		],
	});
}

const { model, temperature, json } = argv;

requireAiConfig(model, json);

let diffContent;

const arg = argv._[0];
const source = arg || 'git';

if (arg) {
	let fileValid = false;
	try {
		const s = await fs.stat(arg);
		fileValid = s.isFile();
	} catch {}

	if (!fileValid) {
		fail(`pr-summary: not a valid file: ${arg}`, json);
	}

	diffContent = await fs.readFile(arg, 'utf8');
} else {
	const isGitRepo = await $`git rev-parse --git-dir`.quiet().catch(() => null);
	if (!isGitRepo) {
		fail('pr-summary: not inside a git repository.', json);
	}

	const mergeBase = await $`git merge-base HEAD main`.quiet().catch(() => null);
	if (mergeBase) {
		diffContent = (await $`git diff ${mergeBase.stdout.trim()}`.quiet()).stdout;
	} else {
		diffContent = (await $`git diff`.quiet()).stdout;
	}
}

diffContent = diffContent.trim();

if (!diffContent) {
	if (json) {
		printJson({ error: 'pr-summary: no diff found.' });
	} else {
		console.log(chalk.yellow('pr-summary: no diff found.'));
	}
	process.exit(0);
}

diffContent = diffContent.slice(0, 12000);

const systemPrompt = `You are an expert developer. Given a git diff, output a PR description in exactly this format:

# <pull-request-title>

## Summary

- point one
- point two

Rules: title under 60 chars. Each bullet under 14 words — action verb + what changed, nothing else. 4 bullets max. No sub-bullets, no explanations, no preamble, no trailing text.`;

const result = await aiStreamRequest({ system: systemPrompt, prompt: diffContent, model, temperature: temperature ?? 0.4, json });

if (json) {
	printJson({ source, output: result.content, model: result.model, usage: result.usage });
}
