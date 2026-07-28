/**
 * Post-build step for static hosts that have no SPA rewrite rule.
 *
 * GitHub Pages serves `404.html` for any path it cannot find on disk. This app
 * is a client-side router, so every deep link (/programs/finance, /admin, …) is
 * exactly that. Copying the built index.html to 404.html makes Pages hand the
 * app back for those URLs; React Router then reads the real path and renders the
 * right page. The user sees no 404 — the HTTP status is 404, but the page is the
 * app. (Our own styled NotFound page still handles genuinely unknown routes.)
 *
 * `.nojekyll` stops Pages from running the files through Jekyll, which would
 * silently drop anything in an underscore-prefixed directory.
 */
import { copyFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))

await copyFile(`${dist}index.html`, `${dist}404.html`)
await writeFile(`${dist}.nojekyll`, '')

console.log('spa-fallback: wrote dist/404.html and dist/.nojekyll')