import { debug, getInput, getMultilineInput, setFailed, setOutput } from '@actions/core'
import { Inputs } from './inputs'
import { upload } from './upload/upload'
import { lstat } from 'fs/promises'
import fetch from 'node-fetch'
import { UrlHelper } from '../../shared/utils/url'
import { writeSummary } from './summary/summary'

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'reason unknown'
  setFailed(`Action failed: ${message}`)
})

async function main() {
  const inputs = await getInputs()

  const artifacts = await upload(inputs)
  await writeSummary(artifacts)

  setOutput('artifacts', artifacts)
}

async function getInputs(): Promise<Inputs> {
  const files = getMultilineInput('files')
  const artifactory = getInput('artifactory')
  const repo = getInput('repo')
  const targetdir = getInput('targetdir')
  const username = getInput('username')
  const password = getInput('password')

  if (repo !== 'github-artifacts' && targetdir === '') {
    throw Error('If not using the github-artifacts repository, a targetdir should be set.')
  }

  for (const file of files) {
    const fileStat = await lstat(file)

    if (fileStat.isDirectory()) {
      throw Error(`Uploading a directory is not supported (found directory ${file})`)
    }
  }

  const url = new UrlHelper(artifactory).appendPath('service/rest/v1/repositories', repo)
  debug(`Validating: ${url.href}`)
  const response = await fetch(url.href, {
    headers: {
      accept: 'application/json',
      authorization: `Basic ${Buffer.from(username + ':' + password).toString('base64')}`,
    },
  })

  if (!response.ok) {
    throw Error(`${url.href} gave response: ${response.status.toString()} - ${response.statusText}`)
  }

  return {
    files,
    artifactory,
    repo,
    targetdir,
    username,
    password,
  }
}
