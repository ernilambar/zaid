#!/usr/bin/env zx

const scriptPath = fs.realpathSync(process.argv[2]);
const { aiStreamRequest, requireAiConfig, printHelp } = await import(path.join(path.dirname(scriptPath), '../lib/ai.mjs'));

if (argv.help || argv.h) {
	printHelp({
		name: 'pr-summary',
		description: 'Generate a PR title and summary from a git diff.',
		usage: 'pr-summary [path-to-diff-file] [--model <name>] [--temperature <n>]',
		examples: [
			'pr-summary',
			'pr-summary changes.diff',
		],
	});
}

const { model, temperature } = argv;

requireAiConfig(model);

let diffContent;

const arg = argv._[0];

if (arg) {
	let fileValid = false;
	try {
		const s = await fs.stat(arg);
		fileValid = s.isFile();
	} catch {}

	if (!fileValid) {
		console.log(chalk.yellow(`pr-summary: not a valid file: ${arg}`));
		process.exit(1);
	}

	diffContent = await fs.readFile(arg, 'utf8');
} else {
	const isGitRepo = await $`git rev-parse --git-dir`.quiet().catch(() => null);
	if (!isGitRepo) {
		console.log(chalk.yellow('pr-summary: not inside a git repository.'));
		process.exit(1);
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
	console.log(chalk.yellow('pr-summary: no diff found.'));
	process.exit(0);
}

diffContent = diffContent.slice(0, 12000);

const systemPrompt = `You are an expert developer. Given a git diff, output a PR description in exactly this format:

# <pull-request-title>

## Summary

- point one
- point two

Rules: title under 60 chars. Each bullet under 14 words — action verb + what changed, nothing else. 4 bullets max. No sub-bullets, no explanations, no preamble, no trailing text.`;

await aiStreamRequest({ system: systemPrompt, prompt: diffContent, model, temperature: temperature ?? 0.4 });
