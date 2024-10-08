# Nexus Upload Action

This action can be used to upload files to the Nexus artifactory.

## Usage

### Download debug artifacts

Downloading debug artifacts from the last run:

```yaml
jobs:
  build:
    uses: .github/workflows/build-artifact
  download:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Download artifact
        uses: tiobe/upload-artifacts-action/download@v2
        with:
          upload-output: ${{ needs.build.outputs.artifacts }}
          username: ${{ secrets.PRIVATE_NEXUS_USERNAME }}
          password: ${{ secrets.PRIVATE_NEXUS_PASSWORD }}
```

### Uploading published artifacts

It is also possible to download other artifacts.

```yaml
jobs:
  download:
    runs-on: ubuntu-latest
    steps:
      - name: Download artifact
        uses: tiobe/upload-artifacts-action/download@v2
        with:
          repo: checkers
          artifact: roslyn
          version: 1.4.0
          username: ${{ secrets.PRIVATE_NEXUS_USERNAME }}
          password: ${{ secrets.PRIVATE_NEXUS_PASSWORD }}
```

### Inputs

| Input           | Description                                                                                                                   | Required |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| `username`      | Nexus username                                                                                                                | &cross;  |
| `password`      | Password of the Nexus user                                                                                                    | &cross;  |
| `artifactory`   | Url of the Nexus artifactory                                                                                                  | &cross;  |
| `repo`          | Name of the Nexus repository                                                                                                  | &cross;  |
| `artifact`      | Artifact to download. Cannot be used in combination with files.                                                               | &cross;  |
| `version`       | The version (tag) of the artifact to download. Used in combination with artifact, if not set it will take the latest version. | &cross;  |
| `targetdir`     | Target directory for the artifacts inside of the Nexus repo (required if `repo` is set)                                       | &cross;  |
| `upload-output` | Output of the upload action. This cannot be used in combination with setting artifact.                                        | &cross;  |
