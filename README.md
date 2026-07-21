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
| `regex "<pattern>"` | Explain a regex pattern with valid/invalid examples |
| `nepali-writer "<text>"` | Translate text into Nepali (Devanagari script) |
| `zai "<question>" [--system "<prompt>"]` | Ask a general question, optionally overriding the system prompt |

All commands accept `--model <name>` and `--temperature <n>`. Use `--help` on any command for usage and examples.

## License

MIT
