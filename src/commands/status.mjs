import 'zx/globals'
import { spinner } from 'zx'
import { getRawClient, getErrorMessage, printJson } from '../lib/ai.mjs'
import { commonOptions } from '../lib/cli.mjs'

export const command = 'status'
export const describe = 'Check that the configured endpoint is reachable.'

export function builder (yargs) {
  return yargs
    .usage('Usage:\n  zaid status [--models] [--json]')
    .options({
      json: commonOptions.json,
      models: { type: 'boolean', default: false, describe: 'Also list available model IDs' }
    })
    .example('zaid status', '')
    .example('zaid status --models', '')
}

export async function handler (argv) {
  const { json, models: showModels } = argv
  const { client, baseURL } = getRawClient(json)

  if (!json) {
    console.log(`Base URL: ${baseURL}`)
    console.log(`Model: ${process.env.ZAID_MODEL || chalk.dim('not set')}`)
  }

  try {
    const response = json ? await client.models.list() : await spinner('Connecting...', () => client.models.list())
    const models = response.data ?? []
    const count = models.length

    if (json) {
      const payload = { baseUrl: baseURL, configuredModel: process.env.ZAID_MODEL || null, connected: true, modelCount: count }
      if (showModels) {
        payload.models = models.map((m) => m.id)
      }
      printJson(payload)
    } else {
      console.log(chalk.green(`Connected. ${count} model(s) available.`))
      if (showModels) {
        for (const model of models) {
          console.log(model.id)
        }
      }
    }
  } catch (error) {
    if (json) {
      printJson({ baseUrl: baseURL, configuredModel: process.env.ZAID_MODEL || null, connected: false, error: getErrorMessage(error) })
    } else {
      console.log(chalk.red(`zaid status: failed to reach ${baseURL}: ${getErrorMessage(error)}`))
    }
    process.exit(1)
  }
}
