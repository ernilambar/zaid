# zaid

AI-powered CLI toolkit. Single `zaid` binary dispatching to yargs command modules.

## Architecture

- `src/index.mjs` — entry point; imports every command module and registers them with `runCli()`.
- `src/commands/*.mjs` — one file per subcommand, each exporting `command`, `describe`, `builder(yargs)`, `handler(argv)`.
- `src/lib/ai.mjs` — shared OpenAI-compatible client helpers: `aiRequest`/`aiStreamRequest`, `getInput`, `requireAiConfig`/`requireBaseUrl`, `printJson`/`fail`.
- `src/lib/cli.mjs` — `runCli(commands)` builds the top-level yargs parser; `commonOptions` (`--model`, `--temperature`, `--json`) shared across commands.
- `src/lib/meta.mjs` — `version`/`description` as plain JS constants, kept manually in sync with `package.json` (Bun and `standard`'s ESLint parser both reject JSON-import syntax).

## Conventions

- Free-text commands declare a variadic positional (`command = 'ask [text..]'`) and read `argv.text`, never `argv._`.
- `zx/globals` is imported per command file for `chalk`/`fs`/`$`; declared in `package.json`'s `standard.globals`.
- Every command supports `--json` for single-line machine-readable output — a hard contract, not optional per-command. See `docs/DOCS.md` for the per-command usage and JSON field spec.
- Env config: `ZAID_BASE_URL` (required), `ZAID_API_KEY` (optional, default `local`), `ZAID_MODEL` (optional if `--model` passed per-invocation).

## Dev workflow

- Bun is the toolchain: `bun install`, `bun test`, `bun run lint` / `bun run format`, `bun run compile`. No npm.
- `bun test` runs the `node:test` suite: `test/lib-ai.test.mjs` unit-tests `src/lib/ai.mjs`, `test/cli.test.mjs` spawns the real binary and checks exit codes/output.
- `bun run lint` / `bun run format` — `standard` (2-space indent, no semicolons — see `.editorconfig`).
- `bun run compile` — `bun build --compile` to a standalone `./zaid` binary.
- CI: `.github/workflows/ci.yml` (test), `lint.yml` (lint), `release.yml` (builds macOS binaries on `v*` tag push) — all via Bun.

## Quality gate

Before considering any change done: `bun run lint` and `bun test` must both pass — these are the same checks `ci.yml`/`lint.yml` run on push.
