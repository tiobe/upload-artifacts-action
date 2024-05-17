import { Artifact, Inputs } from '../interfaces'
import { UrlHelper } from '../utils/url'
import { error, info } from '@actions/core'
import { context } from '@actions/github'
import { parse } from 'canonical-path'
import { createReadStream } from 'fs'
import { lstat } from 'fs/promises'
import fetch from 'node-fetch'

export async function upload(inputs: Inputs): Promise<Artifact[]> {
  const branch = context.ref.replace('refs/heads/', '')

  const targetdir = inputs.targetdir
    ? [inputs.targetdir]
    : [context.repo.owner, context.repo.repo, branch, context.workflow, `run_${context.runId.toString()}`, `attempt_${context.runNumber.toString()}`]

  const repo = new UrlHelper(inputs.artifactory).appendPath('repository', inputs.repo)
  info(`Uploading files to ${repo.href}...`)

  const artifacts: Artifact[] = []
  for (const file of inputs.files) {
    const fileBase = parse(file).base
    const url = new UrlHelper(repo.href).appendPath(...targetdir, fileBase)

    const readStream = createReadStream(file)
    const response = await fetch(url.href, {
      method: 'PUT',
      body: readStream,
      headers: {
        authorization: `Basic ${Buffer.from(inputs.username + ':' + inputs.password).toString('base64')}`,
      },
    })

    if (response.ok) {
      info(`${file} upload completed`)

      const fileStat = await lstat(file)
      artifacts.push({
        name: fileBase,
        size: fileStat.size,
        url: url,
      })
    } else {
      error(`${file} upload failed with: ${response.status.toString()} - ${response.statusText}`)
    }
  }

  if (artifacts.length < inputs.files.length) {
    throw Error(`Upload failed for ${(inputs.files.length - artifacts.length).toString()} out of ${inputs.files.length.toString()} files`)
  }

  return artifacts
}
