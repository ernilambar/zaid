# zaid

AI-powered CLI toolkit. Single `zaid` binary dispatching to yargs command modules.

## Architecture

- `src/scripts/zaid.mjs` — entry point. Imports every command module and registers them with `runCli()`.
- `src/commands/*.mjs` — one file per subcommand. Each exports `command`, `describe`, `builder(yargs)`, `handler(argv)`.
- `src/lib/ai.mjs` — shared OpenAI-compatible client helpers: `aiRequest`/`aiStreamRequest` (non-stream/stream chat completions), `getInput` (positional text or stdin fallback), `requireAiConfig`/`requireBaseUrl` (env validation, exit on failure), `printJson`/`fail`.
- `src/lib/cli.mjs` — `runCli(commands)` builds the top-level yargs parser (strict mode, `--help`/`--version`); `commonOptions` (`--model`, `--temperature`, `--json`) shared across commands.

## Conventions

- Free-text commands declare a variadic positional (`command = 'ask [text..]'`) and read `argv.text` — never `argv._` directly. Under yargs strict-command mode, `argv._[0]` is always the matched command word, not user input.
- `zx/globals` is imported per command file for `chalk`/`fs`/`$`. These are declared in `package.json`'s `standard.globals` so the linter doesn't flag them as undefined.
- Every command supports `--json` for single-line machine-readable output (no spinner/streaming) — this is a hard contract, not optional per-command.
- Env config: `ZAID_BASE_URL` (required), `ZAID_API_KEY` (optional, defaults `local`), `ZAID_MODEL` (optional if `--model` passed per-invocation).

## Dev workflow

- `npm test` — `node:test`. `test/lib-ai.test.mjs` unit-tests `src/lib/ai.mjs`; `test/cli.test.mjs` spawns the real `zaid` binary as a child process and checks exit codes/output for parsing, help, and pre-network validation paths.
- `npm run lint` / `npm run format` — `standard` (zero-config; 2-space indent, no semicolons — see `.editorconfig`).
- CI: `.github/workflows/ci.yml` (test, matrix Node 20.x/22.x) and `.github/workflows/lint.yml` (lint).
