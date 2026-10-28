# limaformat.dev

The website of [Lima](https://github.com/limaformat/lima), the small, fully specified frontmatter format:
[limaformat.dev](https://limaformat.dev).

The specifications, the conformance corpus and the packages live in
[limaformat/lima](https://github.com/limaformat/lima). The specification pages here are copies of its `docs/`, and
the normative text there wins: a correction to a specification belongs there, one to the website's own pages here.

## Layout

- `config.lima` — the site's settings, navigation, and the lists of packages and editors
- `content/pages/` — one bundle per page, written in [Markanto](https://markanto.org)
- `theme/` — templates, stylesheets, scripts, images and fonts
- `scripts/` — `spec-sync-check.ts`, which checks the specification copies against the repository, and the logo
  preparation

## Building

The site is built with [hadley](https://hadley.sh), a static site generator whose repository is not public yet.
[DEPLOYING.md](DEPLOYING.md) has the commands and the checklist for a release.

## License

ISC ([LICENSE](LICENSE)), except the fonts in `theme/assets/fonts/`, which are under the SIL Open Font License 1.1
([OFL.txt](theme/assets/fonts/OFL.txt)).
