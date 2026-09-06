# AGENTS.md

## Overview

zaid is an AI-powered CLI toolkit — a single Node.js binary that dispatches subcommands (ask, shell-cmd, summarize, regex, etc.) to an OpenAI-compatible endpoint via yargs.

## Setup

```bash
bun install
```

Requires Node.js >=22 and [Bun](https://bun.sh). Configure an endpoint:

```bash
export ZAID_BASE_URL="<endpoint-url>"
export ZAID_API_KEY="<api-key>"    # optional, defaults to "local"
export ZAID_MODEL="<model-name>"   # optional if --model is passed per command
```

## Commands

```bash
bun test           # run test suite (node:test)
bun run lint       # lint (standard)
bun run format     # auto-fix formatting (standard --fix)
bun run compile    # build standalone ./zaid binary
bun run src/index.mjs <command> ...   # run CLI from source
```

## Conventions

- One command per file in `src/commands/*.mjs` — each exports `command`, `describe`, `builder(yargs)`, `handler(argv)`.
- Free-text commands use variadic positional (`ask [text..]`) and read `argv.text`, never `argv._`.
- `zx/globals` provides `chalk`, `fs`, `$` per command file (declared as standard globals).
- Every command MUST support `--json` for single-line machine-readable output — this is a hard contract.
- `src/lib/meta.mjs` holds `version`/`description` as plain JS constants kept in sync with `package.json` (Bun and standard's parser both reject JSON-import syntax).

## Quality gate

Run both before declaring any task complete — these must exit 0:

```bash
bun run lint && bun test
```
