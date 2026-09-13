# HTML Embed

Embed an HTML file from your vault inline in a note. The page runs in a sandboxed iframe that sizes itself to its content.

## Usage

```html-embed
file: ELI5/How DNS Works.html
```

| Key | Required | Meaning |
|---|---|---|
| `file` | yes | Vault path, note-relative path, or unique file name |
| `height` | no | Fixed height in px. Omit to auto-size to the page. |

## Security

The iframe uses `sandbox="allow-scripts"` without `allow-same-origin`. Page scripts run, but with an opaque origin: they cannot reach Obsidian, the note, or the filesystem, open popups, or navigate the app. They *can* still load remote resources (fetch, remote images/scripts) and navigate their own frame. Only embed HTML you trust.

Pages must be self-contained: no relative asset paths, and no `<a href>` links — including `#` anchors. A `srcdoc` page has no URL of its own, so relative paths and in-page anchors resolve against Obsidian's own page, which breaks the embed until the note is reopened.

## Theming

Before the page's own content loads, the plugin sets `data-theme="light"` or `data-theme="dark"` on its `<html>` element to match Obsidian. Style with `:root[data-theme="dark"] { … }`. This is the only theme signal — `prefers-color-scheme` inside the iframe follows the OS, not Obsidian, so don't rely on it. A theme toggle applies on the next render (reopen the note).

## Auto-size limits

Auto-size measures the page's `<html>` element. Pages that use a viewport-height unit (`vh`, `svh`, `lvh`, `dvh`, `vmin`, `vmax`) or a percentage `height`/`min-height` on `html`/`body` grow with the iframe until the 20000px cap. Give those pages a fixed `height:`.

## Install

- **BRAT:** Add beta plugin → `jgchristopher/obsidian-html-embed`.
- **Mobile:** the `.html` files must reach the device. With Obsidian Sync, turn on Settings → Sync → Selective sync → Other file types.

## Development

```bash
npm install
npm test        # vitest: parse + srcdoc units
npm run dev     # esbuild watch → main.js
npm run build   # typecheck + production bundle
```

Release: set the same new `version` in `manifest.json` and `package.json`, commit, `git push origin main`, then create and push the matching tag (`git tag 0.1.1 && git push origin 0.1.1`). CI checks the tag against both `manifest.json` and `package.json`, tests, builds, and attaches `main.js`, `manifest.json`, `styles.css` to the release.
