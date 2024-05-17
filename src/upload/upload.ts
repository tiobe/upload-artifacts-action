import { Inputs } from '../interfaces'
import { UrlHelper } from '../utils/url'
import { error, info } from '@actions/core'
import { context } from '@actions/github'
import { parse } from 'canonical-path'
import { createReadStream } from 'fs'
import fetch from 'node-fetch'

export async function upload(inputs: Inputs) {
  const branch = context.ref.replace('refs/heads/', '')

  const targetdir = inputs.targetdir
    ? [inputs.targetdir]
    : [context.repo.owner, context.repo.repo, branch, context.workflow, `run_${context.runId.toString()}`, `attempt_${context.runNumber.toString()}`]

  const repo = new UrlHelper(inputs.artifactory).appendPath('repository', inputs.repo)
  info(`Uploading files to ${repo.href}...`)

  let failedUploads = 0
  for (const path of inputs.files) {
    const url = new UrlHelper(repo.href).appendPath(...targetdir, parse(path).base)

    const file = createReadStream(path)
    const response = await fetch(url.href, {
      method: 'PUT',
      body: file,
      headers: {
        authorization: `Basic ${Buffer.from(inputs.user + ':' + inputs.password).toString('base64')}`,
      },
    })

    if (response.ok) {
      info(`${path} upload completed`)
    } else {
      failedUploads++
      error(`${path} upload failed with: ${response.status.toString()} - ${response.statusText}`)
    }
  }

  if (failedUploads > 0) {
    throw Error(`Upload failed for ${failedUploads} out of ${inputs.files.length} files`)
  }
}
