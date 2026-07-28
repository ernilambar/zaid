# zaid

AI-powered CLI toolkit. Single `zaid` binary dispatching to yargs command modules.

## Architecture

- `src/index.mjs` — entry point. Imports every command module and registers them with `runCli()`.
- `src/commands/*.mjs` — one file per subcommand. Each exports `command`, `describe`, `builder(yargs)`, `handler(argv)`.
- `src/lib/ai.mjs` — shared OpenAI-compatible client helpers: `aiRequest`/`aiStreamRequest` (non-stream/stream chat completions), `getInput` (positional text or stdin fallback), `requireAiConfig`/`requireBaseUrl` (env validation, exit on failure), `printJson`/`fail`.
- `src/lib/cli.mjs` — `runCli(commands)` builds the top-level yargs parser (strict mode, `--help`/`--version`); `commonOptions` (`--model`, `--temperature`, `--json`) shared across commands.
- `src/lib/meta.mjs` — `version`/`description` as plain JS constants (not read from `package.json`). Bun's compiler and `standard`'s ESLint 8 parser both reject JSON-import syntax (`with { type: 'json' }`), so this is a second source of truth kept manually in sync with `package.json`'s `version`.
- `zaid summarize` extracts article text via `linkedom` + `@mozilla/readability`, not `jsdom` — `jsdom`'s transitive dep `css-tree` has a broken `createRequire`-based JSON load that Bun's bundler can't statically embed.

## Conventions

- Free-text commands declare a variadic positional (`command = 'ask [text..]'`) and read `argv.text` — never `argv._` directly. Under yargs strict-command mode, `argv._[0]` is always the matched command word, not user input.
- `zx/globals` is imported per command file for `chalk`/`fs`/`$`. These are declared in `package.json`'s `standard.globals` so the linter doesn't flag them as undefined.
- Every command supports `--json` for single-line machine-readable output (no spinner/streaming) — this is a hard contract, not optional per-command.
- Env config: `ZAID_BASE_URL` (required), `ZAID_API_KEY` (optional, defaults `local`), `ZAID_MODEL` (optional if `--model` passed per-invocation).

## Dev workflow

- Bun is the toolchain: `bun install`, `bun test`, `bun run lint` / `bun run format`, `bun run compile`. No npm.
- `bun test` — runs the `node:test`-based suite natively. `test/lib-ai.test.mjs` unit-tests `src/lib/ai.mjs`; `test/cli.test.mjs` spawns the real `zaid` binary as a child process and checks exit codes/output for parsing, help, and pre-network validation paths.
- `bun run lint` / `bun run format` — `standard` (zero-config; 2-space indent, no semicolons — see `.editorconfig`).
- `bun run compile` — `bun build --compile` to a standalone `./zaid` binary (no Node runtime needed on the target machine).
- CI: `.github/workflows/ci.yml` (test) and `.github/workflows/lint.yml` (lint) — both run via Bun, no Node version matrix. `.github/workflows/release.yml` builds and attaches standalone macOS binaries (arm64 + x64) to GitHub Releases on `v*` tag push.
