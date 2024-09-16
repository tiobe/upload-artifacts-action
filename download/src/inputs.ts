import { getInput, info } from '@actions/core'
import { Artifact } from '../../shared/interfaces/artifact'

export class Inputs {
  artifactory: string
  repo: string
  artifact: string
  version: string
  artifacts: Artifact[]
  targetdir: string
  username: string
  password: string

  constructor() {
    this.artifactory = getInput('artifactory')

    this.repo = getInput('repo')
    this.artifact = getInput('artifact')
    this.version = getInput('version')

    this.artifacts = this.parseUploadOutput()

    this.targetdir = getInput('targetdir')
    this.username = getInput('username')
    this.password = getInput('password')

    this.validate()
  }

  private parseUploadOutput(): Artifact[] {
    const input = getInput('upload-output')

    if (input) {
      return JSON.parse(input) as Artifact[]
    }
    return []
  }

  private validate() {
    if (this.artifact && this.artifacts.length > 0) {
      throw Error('`artifact` and `upload-output` cannot be used at the same time')
    }

    if (!this.artifact && this.artifacts.length === 0) {
      throw Error('Either `artifact` or `upload-output` should be set.')
    }

    if (this.artifact && !this.repo) {
      throw Error('When `artifact` is given, `repo` must be set')
    }
  }
}
