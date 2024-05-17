import { UrlHelper } from './utils/url'

export interface Inputs {
  files: string[]
  artifactory: string
  repo: string
  targetdir: string
  user: string
  password: string
}

export interface Artifact {
  name: string
  size: number
  url: UrlHelper
}
