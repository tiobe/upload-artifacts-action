# Nexus Upload Action

This action can be used to upload files to the Nexus artifactory.

## Usage

### Uploading debug artifacts

Uploading to the github-artifacts repo is the default.

```yaml
jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - name: Upload artifact
        uses: tiobe/upload-artifacts-action/upload@v2
        with:
          files: |
            file1.ext
            file2.ext
          username: '${{ secrets.PRIVATE_NEXUS_USERNAME }}'
          password: '${{ secrets.PRIVATE_NEXUS_PASSWORD }}'
```

### Uploading published artifacts

It is also possible to upload artifacts to other repositories. If this option is set a targetdir should be defined.

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Upload artifact
        uses: tiobe/upload-artifacts-action/upload@v2
        with:
          repo: checkers
          targetdir: <checker>/<version>
          files: file.ext
          username: '${{ secrets.PRIVATE_NEXUS_USERNAME }}'
          password: '${{ secrets.PRIVATE_NEXUS_PASSWORD }}'
```

### Inputs

| Input         | Description                                                                             | Required |
| ------------- | --------------------------------------------------------------------------------------- | -------- |
| `files`       | Files to upload (directories are not supported)                                         | &check;  |
| `username`    | Nexus username                                                                          | &cross;  |
| `password`    | Password of the Nexus user                                                              | &cross;  |
| `artifactory` | Url of the Nexus artifactory to upload to                                               | &cross;  |
| `repo`        | Name of the Nexus repository to upload to                                               | &cross;  |
| `targetdir`   | Target directory for the artifacts inside of the Nexus repo (required if `repo` is set) | &cross;  |

### Outputs

| Output      | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| `artifacts` | The artifacts that have been uploaded with their name, url and size in bytes. |
