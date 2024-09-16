export interface ExtendedArtifact {
  version: string
  files: {
    name: string
    downloadUrl: string
  }[]
}
