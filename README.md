# zaid

AI-powered CLI toolkit.

## Install / Upgrade

**macOS** — Homebrew:

```bash
brew tap ernilambar/tap
brew trust ernilambar/tap
brew install ernilambar/tap/zaid
```

**macOS** — prebuilt binary (replace `arm64` with `amd64` for Intel Macs):

```bash
curl -fL -o zaid https://github.com/ernilambar/zaid/releases/latest/download/zaid-darwin-arm64
xattr -d com.apple.quarantine zaid 2>/dev/null || true
chmod +x zaid
sudo mv zaid /usr/local/bin/
zaid --version
```

**From source** (requires Node.js 22+ and [Bun](https://bun.sh)):

```bash
git clone https://github.com/ernilambar/zaid.git
cd zaid
bun install
bun run compile
sudo mv zaid /usr/local/bin/
```

## Configure

Uses an OpenAI-compatible endpoint.

```bash
export ZAID_BASE_URL="<endpoint-url>"
export ZAID_API_KEY="<api-key>"   # optional, defaults to "local"
export ZAID_MODEL="<model-name>"  # optional if passing --model per command
```

### Examples

**OpenAI**

```bash
export ZAID_BASE_URL="https://api.openai.com/v1"
export ZAID_API_KEY="<openai-api-key>"
export ZAID_MODEL="gpt-4o-mini"
```

**Ollama** (local)

```bash
export ZAID_BASE_URL="http://localhost:11434/v1"
export ZAID_MODEL="llama3.1"
```

## Commands

All commands run through the single `zaid` binary: `zaid <command> ...`. Run `zaid --help` to list them, or `zaid <command> --help` for usage and examples.

| Command | Description |
| --- | --- |
| `zaid ask "<question>" [--system "<prompt>"]` | Ask a general question, optionally overriding the system prompt |
| `zaid shell-cmd "<description>" [--os <macos\|linux\|windows>]` | Convert plain English into a shell command, targeting your OS by default |
| `zaid function-info <name>` | Explain a PHP function or WordPress hook/action/filter |
| `zaid pr-summary [diff-file]` | Generate a PR title and summary from a git diff |
| `zaid proofread "<text>"` | Proofread text and return corrected output, preserving format |
| `zaid email-writer "<notes or draft>"` | Compose a formal email from notes or a rough draft |
| `zaid regex "<description>"` | Convert a plain-English description into a regex pattern |
| `zaid nepali-writer "<text>"` | Translate text into Nepali (Devanagari script) |
| `zaid summarize <url\|file\|"text">` | Summarize a URL, local text file, or direct text as bullet points |
| `zaid explain-error "<error output>"` | Analyze error output and get a concise explanation with a fix |
| `zaid status [--models]` | Check that the configured endpoint is reachable, optionally listing model IDs |

All commands accept `--model <name>` and `--temperature <n>`. All commands accept `--json` to print a single-line JSON object (no spinner, no streaming) instead of formatted output.

Commands that take free-text input also accept it piped via stdin when no argument is given, e.g. `cat error.log | zaid explain-error`.

See [docs/DOCS.md](docs/DOCS.md) for detailed examples of every command.

## Development

After cloning and `bun install`, run `bun link` to make the `zaid` command available on your PATH pointing at the source, instead of `bun run compile`.

```bash
bun test           # run tests (node:test)
bun run lint        # check code style (standard)
bun run format      # auto-fix code style (standard --fix)
bun run compile     # build a standalone binary (./zaid)
```

### Manual Testing

Before opening a PR, verify the key commands against the real CLI:

```bash
bun src/index.mjs ask "What is the capital of France?"
bun src/index.mjs shell-cmd "list files modified in the last 7 days"
bun src/index.mjs function-info wp_head
bun src/index.mjs pr-summary
bun src/index.mjs proofread "Their are many reasons why this is importent."
bun src/index.mjs email-writer "tell client the deadline moved to friday"
bun src/index.mjs regex "a date in YYYY-MM-DD format"
bun src/index.mjs nepali-writer "Hello, how are you?"
bun src/index.mjs summarize https://example.com/article
bun src/index.mjs explain-error "npm ERR! code ENOENT"
bun src/index.mjs status
```

## Release

Tags must be prefixed with `v` (e.g. `v1.0.1`). The release workflow triggers on `v*` tags only — an unprefixed tag like `1.0.1` will not build or publish binaries.

```bash
git tag v1.0.1
git push origin v1.0.1
```

## Copyright and License

This project is licensed under the [MIT](http://opensource.org/licenses/MIT).

2026 &copy; [Nilambar Sharma](https://www.nilambar.net).
