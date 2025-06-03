import { setFailed } from '@actions/core'
import { Inputs } from './inputs'
import { downloadArtifact, downloadArtifactsByUrl, Options } from '@tiobe/artifacts'

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'reason unknown'
  setFailed(`Action failed: ${message}`)
})

async function main() {
  const inputs = new Inputs()

  const options: Options = {
    auth: {
      username: inputs.username,
      password: inputs.password,
    },
    artifactory: inputs.artifactory,
    targetDir: inputs.targetdir,
  }

  let success: boolean | undefined
  if (inputs.artifact) {
    success = await downloadArtifact(
      {
        repo: inputs.repo,
        artifact: inputs.artifact,
        version: inputs.version,
      },
      options,
    )
  } else if (inputs.artifacts.length > 0) {
    success = await downloadArtifactsByUrl(inputs.artifacts, options)
  }

  if (!success) setFailed('Action failed with issues')
}
