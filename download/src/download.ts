import { debug, info, error } from '@actions/core'
import { Inputs } from './inputs'
import { existsSync, createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { finished } from 'stream/promises'
import * as path from 'canonical-path'
import { Artifact } from '../../shared/interfaces/artifact'
import { AssetsResponse, Item } from '../../shared/interfaces/response'
import fetch from 'node-fetch'
import { UrlHelper } from '../../shared/utils/url'
import { ExtendedArtifact } from './artifact'
import { gt } from 'semver'

export async function downloadArtifact(inputs: Inputs): Promise<boolean> {
  const headers = getHeaders(inputs.username, inputs.password)

  const items = await retrieveArtifacts(inputs.artifactory, inputs.repo, headers)
  const artifacts = getArtifactsWithName(items, inputs.artifact)

  if (artifacts.length == 0) {
    throw Error(`Artifact ${inputs.artifact} not found in repository ${inputs.repo}`)
  }

  let artifact: ExtendedArtifact | undefined
  if (inputs.version) {
    artifact = artifacts.find(a => a.version === inputs.version)

    if (!artifact) {
      throw Error(`Version ${inputs.version} of artifact ${inputs.artifact} not found in repository ${inputs.repo}`)
    }
  } else {
    artifact = artifacts.reduce((maxArtifact, currentArtifact) => {
      return gt(currentArtifact.version, maxArtifact.version) ? currentArtifact : maxArtifact
    })
  }

  let ok = true
  for (const file of artifact.files) {
    // size is not used, so use placeholder
    const succeeded = await download({ name: file.name, url: file.downloadUrl, size: 0 }, inputs.targetdir, headers)
    if (!succeeded) ok = false
  }
  return ok
}

async function retrieveArtifacts(artifactory: string, repo: string, headers: HeadersInit): Promise<Item[]> {
  const url = new UrlHelper(artifactory).appendPath('service/rest/v1/assets').addQueryParam('repository', repo)
  const items: Item[] = []

  info(`Retrieving all artifacts from ${url.href}`)
  let assetsResponse: AssetsResponse | undefined = undefined
  do {
    const response = await fetch(url.addQueryParam('continuationToken', assetsResponse?.continuationToken).href, { headers })

    if (!response.ok) {
      throw Error(`${url.href} gave response: ${response.status.toString()} - ${response.statusText}`)
    }

    assetsResponse = (await response.json()) as AssetsResponse
    items.push(...assetsResponse.items)
  } while (assetsResponse.continuationToken)

  return items
}

function getArtifactsWithName(items: Item[], name: string): ExtendedArtifact[] {
  const artifacts: ExtendedArtifact[] = []

  for (const item of items) {
    const path = item.path.split('/')

    if (path[0] !== name) continue

    const find = artifacts.find(a => a.version === path[1])
    if (find) {
      find.files.push({
        name: path[2],
        downloadUrl: item.downloadUrl,
      })
    } else {
      artifacts.push({
        version: path[1],
        files: [
          {
            name: path[2],
            downloadUrl: item.downloadUrl,
          },
        ],
      })
    }
  }

  return artifacts
}

export async function downloadUrls(inputs: Inputs): Promise<boolean> {
  let ok = true

  const headers = getHeaders(inputs.username, inputs.password)
  for (const artifact of inputs.artifacts) {
    const succeeded = await download(artifact, inputs.targetdir, headers)
    if (!succeeded) ok = false
  }

  return ok
}

async function download(artifact: Artifact, targetdir: string, headers: HeadersInit): Promise<boolean> {
  info(`Downloading ${artifact.name} artifact from ${artifact.url.toString()}`)

  const response = await fetch(artifact.url, { headers })

  const targetPath = path.resolve(targetdir)
  if (response.ok && response.body) {
    if (!existsSync(targetPath)) {
      debug(`${targetPath.toString()} does not exist, creating it.`)
      await mkdir(targetPath, { recursive: true })
    }

    const destination = path.join(targetPath, artifact.name)
    debug(`to: ${destination}`)

    const fileStream = createWriteStream(destination)
    await finished(response.body.pipe(fileStream))
  } else {
    error(`${artifact.name} download failed with: ${response.status.toString()} - ${response.statusText}`)
    return false
  }

  return true
}

function getHeaders(username: string, password: string): HeadersInit {
  if (username) {
    return {
      authorization: `Basic ${Buffer.from(username + ':' + password).toString('base64')}`,
    }
  }
  return {}
}
