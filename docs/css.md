# Prose CSS: initial contract

The public entry is `css/prose.css`. Both the static HTML laboratory
and `examples/standalone.html` load this entry unchanged. The CSS requires no
framework, JavaScript, build or preprocessing.

```html
<link rel="stylesheet" href="css/prose.css" />
<article class="prose" data-paragraphs="space" lang="de">
  <h1>A readable text</h1>
  <p>The first paragraph.</p>
  <p>The next paragraph.</p>
</article>
```

## Public properties

Set properties on the prose root or its host. The API is an initial working
contract; final naming, completeness and nested override behavior remain subject to refinement.

| Property | Default | Purpose |
| --- | --- | --- |
| `--prose-font-family` | `system-ui, sans-serif` | Body family |
| `--prose-font-size` | `clamp(1rem, 0.9rem + 0.45vi, 1.25rem)` | Body size |
| `--prose-font-weight` | `400` | Body weight |
| `--prose-line-height` | `1.6` | Inherited line height |
| `--prose-measure` | `65ch` | Maximum inline size, capped by available space |
| `--prose-flow-space` | `1em` | Space between text blocks |
| `--prose-paragraph-space` | `0`, or `1em` in spaced mode | Space between adjacent paragraphs |
| `--prose-paragraph-indent` | `1em` in indented mode | Indent of adjacent paragraphs |
| `--prose-heading-weight` | `600` | Heading weight |
| `--prose-heading-line-height` | `1.2` | Heading line height |
| `--prose-h1-size` | `2.0736em` | Level-one heading size |
| `--prose-h2-size` | `1.728em` | Level-two heading size |
| `--prose-h3-size` | `1.44em` | Level-three heading size |
| `--prose-h4-size` | `1.2em` | Level-four heading size |
| `--prose-h5-size`, `--prose-h6-size` | `1em` | Independent level-five/six heading sizes |
| `--prose-small-size` | `0.875em` | Captions and small text |
| `--prose-code-size` | `0.875em` | Inline/preformatted code, keyboard text and sample output |
| `--prose-table-size` | `0.9em` | Table text |
| `--prose-strong-weight` | `600` | Emphasis and table headers |
| `--prose-font-mono` | `ui-monospace, monospace` | Code and keyboard text |
| `--prose-color` | `#252a32` | Body color |
| `--prose-heading-color` | `currentColor` | Heading color |
| `--prose-link-color`, `--prose-focus-color` | `#184db5` | Link and focus colors |
| `--prose-muted-color` | `#535d6b` | Captions |
| `--prose-rule-color` | `#c7cdd6` | Borders and separators |
| `--prose-code-background` | `#eef2f6` | Code block background |

Properties beginning `--_` are internal. No root font size is set. `rem` follows
the browser's default size; `ch` measures the font's zero glyph and does not promise
an exact count of text characters. The initial scale is not an accepted optical
calibration or a claim that fluid sizing meets every zoom requirement.

Element-size defaults are defined together in `base.css` as internal `--_size-*`
properties. The initial heading sizes are powers of 1.2, not a shared Cube scale.
Element rules consume public overrides directly and fall back to those defaults;
the library does not assign public size properties on `.prose`, which would
otherwise mask values inherited from a host. For example:

```css
.article-host {
  --prose-h1-size: 2.5em;
  --prose-code-size: 0.9em;
}
```

Values in `em` follow the parent text size. Code, keyboard text and sample output
inside a preformatted block inherit its size rather than applying the factor again.

### Element and rhythm adjustments

These properties also inherit from a host and are consumed at the relevant
element. Defaults stay in the rule's `var()` fallback, so a root assignment does
not mask an inherited override. They stay local to Prose, outside the shared theme.

| Property | Default | Purpose |
| --- | --- | --- |
| `--prose-heading-space` | `1.5em` | Space before a non-opening heading |
| `--prose-after-heading-space` | `0.65em` | Heading-to-content or consecutive-heading gap |
| `--prose-list-indent`, `--prose-definition-indent` | `1.5em` | List and definition indentation |
| `--prose-list-space` | `0.35em` | List-item and nested-list rhythm |
| `--prose-definition-space` | `0.75em` | Space before the next definition term |
| `--prose-quote-padding`, `--prose-quote-rule-width` | `1em`, `0.15em` | Quote inset and rule |
| `--prose-quote-paragraph-space` | `0.65em` | Paragraph rhythm within quotes |
| `--prose-caption-space` | `0.5em` | Gap before a figure caption |
| `--prose-link-underline-width`, `--prose-link-underline-hover-width`, `--prose-link-underline-offset` | `0.075em`, `0.13em`, `0.16em` | Link decoration |
| `--prose-focus-width`, `--prose-focus-offset` | `2px`, `3px` | Focus geometry |
| `--prose-pre-padding`, `--prose-pre-line-height`, `--prose-tab-size` | `1em`, `1.55`, `2` | Preformatted text |
| `--prose-kbd-padding`, `--prose-kbd-border-width`, `--prose-kbd-radius` | `0.1em 0.3em`, `1px`, `0.2em` | Keyboard key geometry |
| `--prose-cell-padding`, `--prose-table-rule-width` | `0.55em 0.7em`, `1px` | Table cells |
| `--prose-table-caption-space`, `--prose-table-caption-weight` | `0.5em`, strong weight | Table captions |
| `--prose-rule-space`, `--prose-rule-width` | `1.5em`, `1px` | Separators |
| `--prose-hyphenate-limit-chars` | `7 3 3` | Optional browser hyphenation limits |
| `--prose-kerning`, `--prose-optical-sizing`, `--prose-ligatures` | `normal`, `auto`, `common-ligatures contextual` | Font-sensitive text features |
| `--prose-numerals`, `--prose-heading-numerals` | `oldstyle-nums proportional-nums`, `lining-nums proportional-nums` | Reading and heading numeral profiles |
| `--prose-code-numerals`, `--prose-table-numerals` | `lining-nums tabular-nums` | Independent code and table numeral profiles |
| `--prose-h6-style` | `italic` | Level-six heading style |

Post-heading rhythm includes paragraphs, lists and structural `div`, `section`
and `aside` wrappers, including `.prose-table`. An opening direct child has no
block-start margin, including when it is a separator; the host owns outer spacing.

## Modes and scope

- `.prose` uses first-line indents for adjacent paragraphs; opening paragraphs
  and paragraphs after other elements start flush.
- `data-paragraphs="space"` (or `.prose-block`) uses spacing without indents.
- `data-alignment="justify"` enables a comparison of justified paragraphs.
  The default is start-aligned. Addresses and quotes remain start-aligned.
- Put `data-prose-ui` on embedded UI to exclude it and its descendants from the
  library's element rules. Inherited typography still crosses that boundary;
  the component should declare its own typography when it needs a full reset.
- Use `<div class="prose-table" role="region" aria-label="…" tabindex="0">`
  around tables that need horizontal scrolling. Code blocks can also scroll;
  add `tabindex="0"` and a meaningful label when keyboard scrolling is needed.
- Set the correct `lang` on the page or the relevant text to enable appropriate
  hyphenation. Browser dictionaries and optional text-wrapping features differ.

## Basis and cascade

The entry imports four internal files into the same `prose` layer, in this order:

| File | Responsibility |
| --- | --- |
| `base.css` | Reading defaults, inherited properties and local normalization |
| `elements.css` | Heading scale, emphasis, links, lists, quotes, media, code and tables |
| `flow.css` | Relationships between blocks, paragraph rhythm and spacing exceptions |
| `modes.css` | Spaced paragraphs and the optional justification comparison |

Copy the complete `css/` directory. Native relative imports keep ordinary use
build-free. The sections are maintenance responsibilities, not new cascade
layers: all rules remain in `prose`. Flow follows element defaults so its
relationship rules can override heading spacing; paragraph exceptions follow
the general adjacent-paragraph rule. Modes come last.

The `prose` cascade layer normalizes margins, box sizing, lists, tables, and
responsive images only inside `.prose`. It supplies typography that the old site
inherited from its global CSS. It does not reset `html`, `body`, forms or UI outside
the prose region. The host owns page layout and external spacing around `.prose`.

Element rules use low-specificity `:where()` selectors. Unlayered host styles
win over this layer. A host that organizes its own layers should order them
deliberately. Native CSS nesting is used; this implementation is verified in the installed
Chromium, Firefox and WebKit engines, not against a legacy-browser policy.
The macOS test configuration isolates Firefox application data from the installed browser.

## Boundaries of this first implementation

Basic headings, emphasis, links, paragraphs, lists, definitions, quotes, figures,
code, tables, separators and addresses are represented in the laboratory. This is
not final acceptance of the complete element and typography contract. Run-in headings,
font-specific OpenType profiles, a complete HTML matrix, dark mode, optical
calibration and full accessibility acceptance remain follow-up work.

The original laboratory uses system serif/sans stacks for comparison. The optional
shared-theme comparison uses locally copied Source fonts; no archived font or
marketing-site dependency is copied into the active project.

## Optional shared theme

The optional entry is `theme/prose.css`, supplied by the documented
[theme transfer](theme.md). It adds internal color/font defaults only; explicit
`--prose-*` values on a root or ancestor take precedence. Properties named
`--_desy-prose-*` are integration-internal. Without this entry, the original
literal fallbacks remain unchanged, even if shared color/font tokens happen to
exist on the host.

Shared values cover colors and font families. Measure, paragraph treatment, size,
line height and spacing stay local to this library. A measure expressed in `ch`
can change its pixel width with the selected font. The theme does not style the
page background or import the Cube stylesheet.
