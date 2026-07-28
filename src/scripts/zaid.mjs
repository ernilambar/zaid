#!/usr/bin/env node
import { runCli } from '../lib/cli.mjs'
import * as ask from '../commands/ask.mjs'
import * as shellCmd from '../commands/shell-cmd.mjs'
import * as functionInfo from '../commands/function-info.mjs'
import * as prSummary from '../commands/pr-summary.mjs'
import * as proofread from '../commands/proofread.mjs'
import * as emailWriter from '../commands/email-writer.mjs'
import * as regex from '../commands/regex.mjs'
import * as nepaliWriter from '../commands/nepali-writer.mjs'
import * as summarize from '../commands/summarize.mjs'
import * as explainError from '../commands/explain-error.mjs'
import * as status from '../commands/status.mjs'

runCli([
  ask,
  shellCmd,
  functionInfo,
  prSummary,
  proofread,
  emailWriter,
  regex,
  nepaliWriter,
  summarize,
  explainError,
  status
])
