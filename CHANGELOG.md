# Zaid Changelog

## 2.0.0 - 2026-10-14
- Changed: macOS prebuilt releases are now Apple Silicon (arm64) only, dropping Intel (x64) support
- Changed: replaced the `standard` linter with `eslint` and `neostandard`
- Changed: updated dependencies
- Fixed: macOS binaries are built on macOS runners so they are properly signed

## 1.0.5 - 2026-08-26
- Added: `man` command to explain shell commands and common flags
- Added: `proofread --style` flag to rewrite in a specific tone
- Changed: endpoint errors now fail gracefully with the underlying cause instead of a stack trace

## 1.0.4 - 2026-08-22
- Changed: clarify the task for "nepali-writer" command
- Changed: echo command input only on TTY

## 1.0.3 - 2026-08-10
- Added: pr-summary --base flag to override the auto-detected base branch

## 1.0.2 - 2026-08-08
- Fixed: pr-summary and summarize --json output now include the input field

## 1.0.1 - 2026-07-28
- Changed: regex command now generates a pattern from a plain-English description

## 1.0.0 - 2026-07-28
- Initial release
