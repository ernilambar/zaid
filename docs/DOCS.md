# Scripts

All commands run through the single `zaid` binary: `zaid <command> ...`. All commands accept `--model <name>`, `--temperature <n>`, and `--json` (single-line JSON output, no spinner/streaming). Use `zaid <command> --help` for usage.

Commands that take free-text input also accept it piped via stdin when no argument is given.

## ask

Ask a general question, optionally overriding the system prompt.

```bash
zaid ask "What is the difference between TCP and UDP?"
zaid ask "Rewrite this sentence formally: hey can u send the file" --system "You are a concise editor."
```

## email-writer

Compose a formal email from notes or a rough draft.

```bash
zaid email-writer "tell client the deadline moved to friday, need their assets by wednesday"
cat notes.txt | zaid email-writer
```

## explain-error

Analyze error output and get a concise explanation with a fix.

```bash
zaid explain-error "npm ERR! code ENOENT"
zaid explain-error "$(cat error.log)"
```

## function-info

Explain a PHP function or WordPress hook/action/filter.

```bash
zaid function-info array_map
zaid function-info wp_head
```

## nepali-writer

Translate text into Nepali (Devanagari script).

```bash
zaid nepali-writer "Hello, how are you?"
```

## pr-summary

Generate a PR title and summary from a git diff.

```bash
zaid pr-summary
zaid pr-summary changes.diff
```

## proofread

Proofread text and return corrected output, preserving format.

```bash
zaid proofread "Their are many reasons why this is importent."
cat draft.md | zaid proofread
```

## regex

Explain a regex pattern with valid and invalid match examples.

```bash
zaid regex "^\d{4}-\d{2}-\d{2}$"
```

## shell-cmd

Convert a plain-English description into a shell command. Targets the OS you're running on by default; override with `--os <macos|linux|windows>`.

```bash
zaid shell-cmd "list all files modified in the last 7 days"
zaid shell-cmd "recursively set file permissions to 644" --os linux
```

## summarize

Summarize a URL, local text file, or direct text as bullet points.

```bash
zaid summarize https://example.com/article
zaid summarize notes.txt
zaid summarize "paste your text here"
```

## status

Check that the configured endpoint is reachable, optionally listing available model IDs.

```bash
zaid status
zaid status --models
```
