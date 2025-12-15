# Optional shared colors and fonts

The shared theme supplies Source Serif 4 for reading, Source Code Pro for code,
and common color roles. Local Source Sans 3 is also available for host UI.
The default reading stylesheet remains independent.

## Refresh the local copy

In a checkout of the CSS design-system variant, run:

```sh
npm run sync:prose-theme -- /absolute/path/to/this-checkout/theme
```

The explicit destination is the copied theme directory. The command copies the
theme CSS, fonts, licenses and provenance, updates managed files, and preserves
unrelated destination files. Treat copied files as managed output; change the
master values before refreshing the copy. Final token governance is deferred.

## Enable it

```html
<link rel="stylesheet" href="css/prose.css">
<link rel="stylesheet" href="theme/prose.css">
<article class="prose" lang="en">...</article>
```

Both links are local to this repository. The optional theme entry imports its
own local tokens and fonts. Either stylesheet load order works, because the
theme supplies internal fallbacks and never assigns public `--prose-*` overrides.
Without the theme link, standalone defaults remain unchanged. Explicit public
overrides on a root or ancestor remain first in the fallback chain.

The theme changes colors and font families only. Paragraph modes, measure,
line height, size and spacing remain Prose's responsibility. The host owns the
page surface and outer layout; it may use `--desy-color-background` itself.
The copied font declarations retain system fallbacks and `font-display: swap`.

Keep bundled font licenses and provenance with the assets. Normal use requires
neither the source checkout nor a font service. The local
[comparison laboratory](../examples/theme-lab.html) switches between standalone,
shared theme and explicit host overrides. Its controls need JavaScript; the
initial themed reading specimen does not.
