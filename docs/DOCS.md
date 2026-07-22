# Scripts

All commands accept `--model <name>`, `--temperature <n>`, and `--json` (single-line JSON output, no spinner/streaming). Use `--help` on any command for its usage.

Commands that take free-text input also accept it piped via stdin when no argument is given.

## email-writer

Compose a formal email from notes or a rough draft.

```bash
email-writer "tell client the deadline moved to friday, need their assets by wednesday"
cat notes.txt | email-writer
```

## explain-error

Analyze error output and get a concise explanation with a fix.

```bash
explain-error "npm ERR! code ENOENT"
explain-error "$(cat error.log)"
```

## function-info

Explain a PHP function or WordPress hook/action/filter.

```bash
function-info array_map
function-info wp_head
```

## nepali-writer

Translate text into Nepali (Devanagari script).

```bash
nepali-writer "Hello, how are you?"
```

## pr-summary

Generate a PR title and summary from a git diff.

```bash
pr-summary
pr-summary changes.diff
```

## proofread

Proofread text and return corrected output, preserving format.

```bash
proofread "Their are many reasons why this is importent."
cat draft.md | proofread
```

## regex

Explain a regex pattern with valid and invalid match examples.

```bash
regex "^\d{4}-\d{2}-\d{2}$"
```

## shell-cmd

Convert a plain-English description into a shell command.

```bash
shell-cmd "list all files modified in the last 7 days"
```

## summarize

Summarize a URL, local text file, or direct text as bullet points.

```bash
summarize https://example.com/article
summarize notes.txt
summarize "paste your text here"
```

## zai

Ask a general question, optionally overriding the system prompt.

```bash
zai "What is the difference between TCP and UDP?"
zai "Rewrite this sentence formally: hey can u send the file" --system "You are a concise editor."
```

## zaid-connect

Check that the configured endpoint is reachable.

```bash
zaid-connect
```

## zaid-models

List models available from the configured endpoint.

```bash
zaid-models
```
