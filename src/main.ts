import { debug, getInput, getMultilineInput, setFailed } from '@actions/core'
import { Inputs } from './interfaces'
import { upload } from './upload/upload'
import { lstat } from 'fs/promises'
import fetch from 'node-fetch'
import { UrlHelper } from './utils/url'

main().catch(error => {
  const message = error instanceof Error ? error.message : 'reason unknown'
  setFailed(`Action failed: ${message}`)
})

async function main() {
  const inputs = await getInputs()

  await upload(inputs)
}

async function getInputs(): Promise<Inputs> {
  const paths = getMultilineInput('files')
  const artifactory = getInput('artifactory')
  const repo = getInput('repo')
  const targetdir = getInput('targetdir')
  const user = getInput('user')
  const password = getInput('password')

  if (repo !== 'github-artifacts' && targetdir === '') {
    throw Error('If not using the github-artifacts repository, a targetdir should be set.')
  }

  for (const path of paths) {
    const pathLstat = await lstat(path)

    if (pathLstat.isDirectory()) {
      throw Error(`Uploading a directory is not supported (found directory ${path})`)
    }
  }

  const url = new UrlHelper(artifactory).appendPath('service/rest/v1/repositories', repo)
  debug(`Validating: ${url.href}`)
  const response = await fetch(url.href, {
    headers: {
      accept: 'application/json',
      authorization: `Basic ${Buffer.from(user + ':' + password).toString('base64')}`,
    },
  })

  if (!response.ok) {
    throw Error(`${url.href} gave response: ${response.status} - ${response.statusText}`)
  }

  return {
    files: paths,
    artifactory,
    repo,
    targetdir,
    user,
    password,
  }
}
