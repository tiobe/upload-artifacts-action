export interface Inputs {
  files: string[]
  artifactory: string
  repo: string
  targetdir: string
  username: string
  password: string
}

export interface Artifact {
  name: string
  size: number
  url: string
}
