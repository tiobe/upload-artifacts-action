import { summary } from '@actions/core'
import { Artifact } from '../../../shared/interfaces/artifact'
import { SummaryTableCell, SummaryTableRow } from '@actions/core/lib/summary'

export async function writeSummary(artifacts: Artifact[]) {
  summary.addHeading('Artifacts uploaded')

  summary.addTable(createArtifactsTable(artifacts))

  await summary.write()
}

function createArtifactsTable(artifacts: Artifact[]): SummaryTableRow[] {
  const rows: SummaryTableRow[] = []

  const headers: SummaryTableCell[] = [
    {
      data: 'Name',
      header: true,
    },
    {
      data: 'Size',
      header: true,
    },
    {
      data: '',
    },
  ]
  rows.push(headers)

  for (const artifact of artifacts) {
    const row: SummaryTableCell[] = [
      {
        data: artifact.name,
      },
      {
        // get size in MiB
        data: createSize(artifact.size),
      },
      {
        data: createLink('download', artifact.url),
      },
    ]

    rows.push(row)
  }

  return rows
}

function createLink(name: string, url: string): string {
  return `<a class="link" href="${url}">${name}</a>`
}

function createSize(size: number) {
  const sizeInKb = size / 1024

  if (sizeInKb > 1024 * 1024) {
    return `${(sizeInKb / (1024 * 1024)).toFixed(2)} GiB`
  } else if (sizeInKb > 1024) {
    return `${(sizeInKb / 1024).toFixed(2)} MiB`
  } else {
    return `${sizeInKb.toFixed(2)} KiB`
  }
}
