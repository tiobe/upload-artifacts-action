import { setFailed } from '@actions/core'
import { Inputs } from './inputs'
import { downloadArtifact, downloadUrls } from './download'

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'reason unknown'
  setFailed(`Action failed: ${message}`)
})

async function main() {
  const inputs = new Inputs()

  if (inputs.artifact) {
    await downloadArtifact(inputs)
  } else if (inputs.artifacts.length > 0) {
    await downloadUrls(inputs)
  }
}
