# zaid

AI-powered CLI toolkit for everyday tasks.

## Install

```bash
npm install
npm link
```

## Configure

Uses an OpenAI-compatible endpoint.

```bash
export ZAID_BASE_URL="<endpoint-url>"
export ZAID_API_KEY="<api-key>"   # optional, defaults to "local"
export ZAID_MODEL="<model-name>"  # optional if passing --model per command
```

## Commands

| Command | Description |
| --- | --- |
| `shell-cmd "<description>"` | Convert plain English into a shell command |
| `function-info <name>` | Explain a PHP function or WordPress hook/action/filter |
| `pr-summary [diff-file]` | Generate a PR title and summary from a git diff |
| `proofread "<text>"` | Proofread text and return corrected output, preserving format |
| `email-writer "<notes or draft>"` | Compose a formal email from notes or a rough draft |
| `regex "<pattern>"` | Explain a regex pattern with valid/invalid examples |
| `nepali-writer "<text>"` | Translate text into Nepali (Devanagari script) |
| `summarize <url\|file\|"text">` | Summarize a URL, local text file, or direct text as bullet points |
| `zai "<question>" [--system "<prompt>"]` | Ask a general question, optionally overriding the system prompt |
| `zaid-connect` | Check that the configured endpoint is reachable |
| `zaid-models` | List models available from the configured endpoint |

All commands accept `--model <name>` and `--temperature <n>`. Use `--help` on any command for usage and examples.

Commands that take free-text input also accept it piped via stdin when no argument is given, e.g. `cat error.log | explain-error`.

## Copyright and License

This project is licensed under the [MIT](http://opensource.org/licenses/MIT).

2026 &copy; [Nilambar Sharma](https://www.nilambar.net).
