# OC Concierge Doctor website

Static site for OC Concierge Doctor (Tariq A. Khan, MD), Tustin, CA.
Same build system as the Dr. Bar site. Hosted on Cloudflare Workers (static assets).

## Folders

| Path | What it is |
|---|---|
| `src/` | Pages (`index`, `dr-khan`, `concierge`, `contact`, legal, `404`), fonts, images |
| `src/partials/` | Shared pieces pulled in with `{{> name}}` (head/CSS, header, footer, logo mark) |
| `src/treatments/` | One JSON file per treatment page. Also drives the menus, footer and home lists |
| `lib/treatment.mjs` | The shared treatment page layout |
| `src/_redirects` | 301s from the old `/services/*.html` URLs |

## Build

```
node build.mjs
```

Output goes to `site/` (gitignored). Bump `build` in `build.json` each deploy. Set `"preview": false` at launch to drop noindex.

## Add a treatment

Copy any file in `src/treatments/`, change `slug` (must match the file name), `group` (`medical`, `aesthetics`, `regenerative`) and `order`. It shows up in the menus and on the home page automatically.

## Doctor photo

Drop a portrait at `src/img/dr-tariq-khan.jpg`. Until then the logo mark shows in its place.

## Open items before launch

Search the source for `[` to find every placeholder: street address and ZIP, prices, Yelp rating, a few treatment details, NPP privacy officer and effective date.
