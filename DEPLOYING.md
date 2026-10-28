# Deploying limaformat.dev

The site is built with hadley and advertises package versions and sizes
that must already be true in the registries. Follow this order.

## Build & serve locally

The site is built with [hadley](https://hadley.sh); its repository is not public yet. From `site/`:

```sh
hadley dev              # build + file watcher at http://localhost:8000
hadley deploy           # the publish build, served locally for a last look
hadley deploy --build   # the publish build only, into .hadley/publish/
hadley clean            # clear all build directories, e.g. after deleting a page
```

Production serves `.hadley/publish/` as hadley's `main` builds it; the maintainer's deploy script uploads it.

After re-exporting the wordmark from Inkscape, run `bash scripts/prep-logos.sh`:
it runs `theme/assets/images/logo-{light,dark}.svg` through svgo and derives
`logo.svg` (a copy of the dark wordmark) for hadley's OG-card generator.

## Pre-deploy checklist

Run from `site/`:

- [ ] **Spec copies in sync.** `bun scripts/spec-sync-check.ts` → exit 0.
      The three spec pages (`core-spec`, `references-spec`, `references-1-spec`)
      are hand-maintained copies of the normative specs in the monorepo; the
      normative source wins. Set `LIMA_MONOREPO` if it is not at
      `../../../dev/lima/monorepo`.
- [ ] **Package numbers match reality.** Every package version, case count,
      word count, tarball size and ratio on the site matches what npm /
      crates.io / pkg.go.dev serve and what the Lima README states — in the
      theme as in the pages: `theme/templates/partials/nav.sort` (version
      menu), `sidebar.sort`, `home.chase` (status strip, measurements, registry
      cards), `packages.md`, `conformance.md`, and the package descriptions in
      `config.lima`. See the release order below.
- [ ] **Links.** No internal link points at a removed page (`/docs/` hub,
      `/docs/integrations/`, `/docs/migrating-references-1-to-2/`). External
      registry + GitHub links resolve.
- [ ] **Both themes.** Dark is the default; the toggle still reaches light;
      `theme-color` matches (`#1a1a19` / `#f3f0e6`).
- [ ] **Build clean.** No warnings; the sitemap lists every page but the 404.

## Release order (publish before deploy)

The site must never advertise a version the registries do not have.

1. Land every release-affecting change in the monorepo from a clean tree.
2. Run all monorepo gates (JS + corpus + Rust + Go).
3. `cd monorepo/js && bun run build && npm pack --dry-run --json` — read
   `.size`. This is the authoritative tarball size.
4. Propagate that number everywhere it appears — monorepo `README.md`,
   `js/CHANGELOG.md`, `js/scripts/wordcount.md`, and this site's
   `home.chase` §03 — then **pack once more** (the CHANGELOG is inside the
   tarball) and confirm the number is stable.
5. Commit the monorepo, push `main`.
6. Tag `v<version>`, `rust/v<version>`, `go/v<version>` on that same commit;
   push the tags.
7. Publish: `npm publish` (`@limaformat/lima`), `cargo publish` (`lima`);
   let the Go proxy pick up `go/v<version>`.
8. Verify externally: npm and crates.io show the version as latest,
   `pkg.go.dev/...@v<version>` resolves, and an install of each contains the
   expected public API (and **not** the internal References 1.0 resolver).
9. Create the GitHub release from the same commit.
10. Bump hadley to the published Lima (`@limaformat/lima` in hadley's
    `packages/hadley/package.json`), `bun install`, and run hadley's gate and
    its build comparison of every site. The `markanto.org` build depends on
    the same hadley.
11. Only now: run `bun scripts/spec-sync-check.ts`, commit this repo, and
    deploy.
12. Live smoke test: nav version dropdown, the three registry cards, the
    changelog + release links, canonical URLs, sitemap, and both themes.

If a registry publish fails between 7 and 8: do not deploy. Do not
overwrite an immutable artifact that did publish; fix forward with a patch
release if necessary.
