export interface AssetsResponse {
  items: Item[]
  continuationToken?: string
}

export interface Item {
  downloadUrl: string
  path: string
  id: string
  repository: string
  format: string
  checksum: {
    sha1: string
    sha512: string
    sha256: string
    md5: string
  }
  contentType: string
  lastModified: Date
  lastDownloaded?: Date
  uploader: string
  uploaderIp: string
  fileSize: number
  blobCreated?: Date
}
