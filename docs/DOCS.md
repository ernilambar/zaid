# Scripts

All commands run through the single `zaid` binary: `zaid <command> ...`. All commands accept `--model <name>`, `--temperature <n>`, and `--json` (single-line JSON output, no spinner/streaming). Use `zaid <command> --help` for usage.

Commands that take free-text input also accept it piped via stdin when no argument is given.

## `--json` field reference

Fields that recur across commands mean the same thing everywhere they appear:

- `input` — the exact text sent to the model (positional args joined, stdin, or file/URL content after truncation).
- `output` — the model's response.
- `model` — the model actually used to serve the request (`--model` override or `ZAID_MODEL`).
- `usage` — token usage object as reported by the endpoint (`{ prompt_tokens, completion_tokens, total_tokens }`), or `null` if not reported.

Anything command-specific is called out under that command below.

## ask

Ask a general question, optionally overriding the system prompt.

```bash
zaid ask "What is the difference between TCP and UDP?"
zaid ask "Rewrite this sentence formally: hey can u send the file" --system "You are a concise editor."
```

**JSON output:**

```json
{ "input": "...", "system": null, "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

`system` — the system prompt in effect: the `--system` value, or `null` if the default was used.

## email-writer

Compose a formal email from notes or a rough draft.

```bash
zaid email-writer "tell client the deadline moved to friday, need their assets by wednesday"
cat notes.txt | zaid email-writer
```

**JSON output:**

```json
{ "input": "...", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

## explain-error

Analyze error output and get a concise explanation with a fix.

```bash
zaid explain-error "npm ERR! code ENOENT"
zaid explain-error "$(cat error.log)"
```

**JSON output:**

```json
{ "input": "...", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

## function-info

Explain a PHP function or WordPress hook/action/filter.

```bash
zaid function-info array_map
zaid function-info wp_head
```

**JSON output:**

```json
{ "input": "...", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

## nepali-writer

Translate text into Nepali (Devanagari script).

```bash
zaid nepali-writer "Hello, how are you?"
```

**JSON output:**

```json
{ "input": "...", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

## pr-summary

Generate a PR title and summary from a git diff.

```bash
zaid pr-summary
zaid pr-summary changes.diff
```

**JSON output:**

```json
{ "input": "...", "source": "git", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

`input` — the diff actually sent, truncated to 12000 chars.
`source` — where the diff came from: a file path, or `"git"` when read from `git diff`.

## proofread

Proofread text and return corrected output, preserving format.

```bash
zaid proofread "Their are many reasons why this is importent."
cat draft.md | zaid proofread
```

**JSON output:**

```json
{ "input": "...", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

## regex

Convert a plain-English description into a regex pattern.

```bash
zaid regex "a date in YYYY-MM-DD format"
zaid regex "a valid email address"
```

**JSON output:**

```json
{ "input": "...", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

## shell-cmd

Convert a plain-English description into a shell command. Targets the OS you're running on by default; override with `--os <macos|linux|windows>`.

```bash
zaid shell-cmd "list all files modified in the last 7 days"
zaid shell-cmd "recursively set file permissions to 644" --os linux
```

**JSON output:**

```json
{ "input": "...", "os": "macos", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

`os` — target OS used for generation: `macos`, `linux`, or `windows` (`--os`, or auto-detected).

## summarize

Summarize a URL, local text file, or direct text as bullet points.

```bash
zaid summarize https://example.com/article
zaid summarize notes.txt
zaid summarize "paste your text here"
```

**JSON output:**

```json
{ "input": "...", "source": "https://example.com/article", "output": "...", "model": "gpt-4o-mini", "usage": { "prompt_tokens": 12, "completion_tokens": 34, "total_tokens": 46 } }
```

`input` — the extracted text actually sent, truncated to 8000 chars.
`source` — where `input` came from: a URL, a file path, or `"text"` for direct positional text.

## status

Check that the configured endpoint is reachable, optionally listing available model IDs.

```bash
zaid status
zaid status --models
```

Not an AI completion — it only checks endpoint connectivity, so it does not use the `input`/`output`/`usage` shape above.

**JSON output:**

```json
{ "baseUrl": "http://localhost:1234/v1", "configuredModel": "gpt-4o-mini", "connected": true, "modelCount": 12 }
```

| Field | Type | Meaning |
|---|---|---|
| `baseUrl` | string | `ZAID_BASE_URL`. |
| `configuredModel` | string \| null | The `ZAID_MODEL` env value — **not verified against the endpoint**, just echoed. Distinct from other commands' `model`, which is a model actually queried. |
| `connected` | boolean | Whether `client.models.list()` succeeded. |
| `modelCount` | number | Only present when `connected: true`. |
| `models` | string[] | Only present with `--models` and `connected: true`. List of model IDs. |
| `error` | string | Only present when `connected: false`. |

## Errors

Any command that fails validation before hitting the network emits:

```json
{ "error": "pr-summary: not a valid file: /nonexistent/path.diff" }
```

and exits with status **1**. This is the universal error shape — always exactly `{ "error": string }`, no other keys, regardless of command.

This contract covers errors raised *after* argv has parsed successfully (inside a command's handler). It does not cover argument-syntax errors — an unknown command, an unknown flag, or an invalid choice value (e.g. `--os bogus`) — which are yargs parse-time failures, not command-level errors. Those print yargs' usual plain-text usage dump and exit **1** regardless of `--json`. This matches how other `--json`/`--output json` CLIs (`gh`, `aws`) behave: a mistyped flag is a syntax error the parser catches before it knows what output format was requested, not something the command gets a chance to format.

## Exit code 0 with an `error`-shaped payload

One deliberate exception: if a text command (`ask`, `email-writer`, `explain-error`, `function-info`, `nepali-writer`, `pr-summary`, `proofread`, `regex`, `shell-cmd`, `summarize`) is invoked with no positional args and no piped stdin, it prints `{ "error": "<usage string>" }` and exits **0**. This is usage-hint behavior (equivalent to `--help`), not a failure — the command was not given enough to run, but nothing went wrong. Don't treat exit code 0 as proof the `error` key is absent; check the key itself.
