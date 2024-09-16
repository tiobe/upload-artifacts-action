import { setFailed } from '@actions/core'
import { Inputs } from './inputs'
import { downloadArtifact, downloadUrls } from './download'

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'reason unknown'
  setFailed(`Action failed: ${message}`)
})

async function main() {
  const inputs = new Inputs()

  let success
  if (inputs.artifact) {
    success = await downloadArtifact(inputs)
  } else if (inputs.artifacts.length > 0) {
    success = await downloadUrls(inputs)
  }

  if (!success) setFailed('Action failed with issues')
}
