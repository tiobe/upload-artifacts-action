import { createWriteStream } from 'fs'
import { version } from 'os'
import { Readable } from 'stream'
import { finished } from 'stream/promises'
import { Inputs } from '../interfaces'
import { UrlHelper } from '../utils/url'

export async function download(url: UrlHelper, inputs: Inputs) {
  const response = await fetch(url.href, {
    method: 'GET',
    headers: {
      authorization: `Basic ${Buffer.from(inputs.user + ':' + inputs.password).toString('base64')}`,
    },
  })
  if (response.ok) {
    const writeStream = createWriteStream(`perl_check-${version}.zip`)
    const readStream = new Readable()
    const buffer = await response.arrayBuffer()
    readStream.push(Buffer.from(buffer))
    readStream.push(null)
    readStream.pipe(writeStream)
    await finished(writeStream)
  }
}