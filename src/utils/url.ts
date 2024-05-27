export class UrlHelper {
  private readonly url: URL

  get href() {
    return this.url.href
  }

  constructor(url: string) {
    this.url = new URL(url)
  }

  appendPath(...paths: string[]): this {
    for (const path of paths) {
      if (this.url.pathname.endsWith('/')) {
        if (path.startsWith('/')) {
          this.url.pathname += path.substring(1)
        } else {
          this.url.pathname += path
        }
      } else if (path.startsWith('/')) {
        this.url.pathname += path
      } else {
        this.url.pathname += '/' + path
      }
    }
    return this
  }
}
