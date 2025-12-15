# Desy Prose

A small native CSS library for readable long-form text. Semantic HTML, local
typographic defaults and public custom properties work without a framework,
build step or JavaScript. A separate static laboratory makes the decisions
and current limits visible.

## Use

Copy the complete `css/` directory, preserving its internal relative paths:

```html
<link rel="stylesheet" href="css/prose.css">
<article class="prose" data-paragraphs="space" lang="en">
  <h1>A thought worth reading</h1>
  <p>The content sets the pace.</p>
</article>
```

The entry loads a few responsibility-based files with native CSS imports, all
in the existing `prose` layer. Host rules outside named layers take precedence.
The [CSS contract](docs/css.md) describes public properties, paragraph modes,
embedded UI and the current boundaries.

## Repository layout

```text
css/             Public entry, local basis, element rules, text flow and modes
theme/           Optional copied colors, fonts, licenses and Prose adapter
examples/        HTML specimens, laboratory styles and generated browser code
examples/src/    Strict TypeScript sources for optional laboratory controls
docs/            Consumer contracts and theme ownership
scripts/         Development preview and generated-output verification
tests/browser/   Browser verification of the public behavior
```

The library is `css/`; ordinary use does not need examples or development tools.
The optional `theme/` directory is managed by an explicit transfer and remains
independent of the reading rules. See [theme integration](docs/theme.md).

## Open the testbed

Open `examples/index.html` directly in a browser. The checked development preview
uses Node.js LTS Krypton (`lts/krypton` in `.node-version`):

```sh
fnm install
fnm use
npm ci
npm run dev
```

Then visit http://127.0.0.1:4321. The preview builds the checked browser controls
from TypeScript before starting the local Node server. Generated browser files
are included, so viewing the static testbed needs no build or dependencies.

The reading, element and edge-case examples share the same stylesheet. Controls
compare system serif/sans fonts, paragraph spacing/indents, alignment, measure,
leading and fluid/manual text size. Reset restores the initial settings.
System fonts are temporary comparison profiles, not the final font choice.

## Examples

- [Laboratory](examples/index.html): reading, elements and edge cases, with
  optional controls from `examples/src/`.
- [Standalone page](examples/standalone.html): only the public CSS entry,
  without JavaScript, laboratory styles or a global reset.
- [Theme comparison](examples/theme-lab.html): standalone defaults, shared
  colors/fonts and explicit host overrides.
- [Travel handbook](examples/reisehandbuch.html): an original German space-travel story with chapter
  navigation, nested lists, definitions, emphasis, code and two wide tables.
  The story was written for this specimen, using invented characters, places and
  travel data. It includes no quotations, characters or plot from an existing
  work. Each six-column table has an explicit 52rem minimum width inside a
  focusable horizontal scroll region. `reisehandbuch.css` keeps its table values
  together and gives notes enough room without changing the reading library.
  The same optional controls adjust the complete text; they start collapsed on
  narrow views. Reading and chapter links work without JavaScript.

The preview serves examples at its root, with explicit `/css/` and `/theme/`
mounts for the library and optional assets. The example HTML also works directly
from disk. Laboratory presentation is separate from the library's public rules.

## Verify

Development uses Node LTS Krypton (24.12 or newer within Node 24), TypeScript
5.9.3 and Node 24 declarations:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run check
npm run test:all
```

Browser tests start their local Node server automatically.
Set `PROSE_TEST_URL` to test another server. The default suite runs Chromium and WebKit. `npm run test:all` includes Firefox;
the macOS configuration uses isolated Firefox application data for test runs.

`npm run typecheck` checks scripts, tests and browser sources with `strict`,
`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Node executes checked
development scripts directly as TypeScript. Browser output is emitted separately:

```sh
npm run build:lab
npm run check:generated
```

The generated-output check rebuilds into a temporary directory and compares both
files byte for byte. It fails on stale output. Test commands run this check before
opening a browser. None of this changes the build-free CSS entry.

Tests cover controls/reset,
keyboard tabs, code sizing, table numerals, narrow viewports, root font
preferences, UI isolation and use without JavaScript. They do not replace
the optical and accessibility acceptance in the backlog.

## Current scope

Calibration, complete HTML coverage, OpenType profiles, dark mode and packaging
remain separate follow-up work. Shared colors and fonts are optional; the core
reading stylesheet and its defaults remain independent.
