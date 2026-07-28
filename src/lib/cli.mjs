import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { version, description } from './meta.mjs'

export const commonOptions = {
  model: { type: 'string', describe: 'Model name to use for this request' },
  temperature: { type: 'number', describe: 'Sampling temperature (0-2)' },
  json: { type: 'boolean', default: false, describe: 'Print a single-line JSON object instead of formatted output' }
}

export function runCli (commands) {
  const cli = yargs(hideBin(process.argv))
    .scriptName('zaid')
    .usage(`${description}\n\nUsage:\n  zaid <command> [args] [options]`)
    .help('help')
    .alias('help', 'h')
    .version(version)
    .alias('version', 'v')
    .strict()
    .demandCommand(1, 'Run "zaid --help" to see available commands.')
    .recommendCommands()
    .wrap(100)
    .completion()

  for (const command of commands) {
    cli.command(command)
  }

  return cli.parse()
}
