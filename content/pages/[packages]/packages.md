---
title: Packages
description: Three published implementations of Lima Core 1.1 and References 2.0, verified against the same language-neutral conformance corpus.
urlPath: /packages/
template: doc
type: page
---
Lima's normative specifications are written to be implementation-language-agnostic: an independent implementation can follow the specs directly without reading another binding's source. TypeScript is the reference implementation; Rust and Go independently implement the same Lima Core 1.1 and Lima References 2.0 semantics. All three are checked against the same language-neutral [conformance corpus](/conformance/) rather than carrying their own interpretations of edge cases.

## Status

- Lima Core 1.1 specification — final
- Lima References 2.0 specification — final
- Conformance corpus — 336 Core 1.1 cases (the 218 Core 1.0 cases — a byte-frozen 149-case 1.0.0 baseline plus additive errata through 1.0.10 — without the 8 that Core 1.1 supersedes, plus 126 Core 1.1 cases) and a separate 136-case References 2.0 suite
- Differential test — TypeScript, Rust and Go parse the same random documents, 200,000 parses per implementation in every CI run, and must agree on every value, warning and error
- TypeScript/JavaScript implementation — published as `@limaformat/lima` 0.6.0; passes Core 1.1 and References 2.0 (136/136) through the public API
- Rust implementation — published as `lima` 0.6.0; passes both suites and exposes References 2.0 through `parse`
- Go implementation — published as `github.com/limaformat/lima/go` at `go/v0.6.0`; passes both suites and exposes References 2.0 through `Parse`

Lima Core is at 1.1. Core 1.0 was frozen; corrections shipped only as additive errata revisions (through 1.0.10), driven by the conformance corpus rather than a single implementation's convenience, and never altering the byte-frozen 1.0.0 baseline. Core 1.1 (2026-10-28) is the one change since, which an erratum could not carry: strict mode rejects a content line that belongs to no structure, and Core 1.1 settles cases Core 1.0 left open, such as a sequence at its key's own column. Lima References 2.0 is final as of 2026-08-12.

An earlier References 1.0 was published briefly in mid-2026 and superseded almost immediately by References 2.0, which is not syntax-compatible with it. Its [archived specification](/docs/references-1-spec/) and 101-case regression corpus stay in the repository; it is not a current target.

## Why TypeScript first

Lima's own tooling — the site generator this documentation is built with, and the broader author ecosystem it grew out of — is Bun/TypeScript-native, so the reference implementation started there. That's a starting point, not a ceiling: the specs don't privilege JavaScript semantics anywhere except one explicitly documented, narrow exception.

**Float serialisation** (References §3.5.1) is normatively anchored to the ECMAScript `Number::toString` algorithm, including its fixed-vs-exponential thresholds — a deliberate trade-off for cross-language output parity. Any other implementation must reproduce those thresholds exactly (using Ryu or Dragonbox internally is fine; the digit sequence and fixed/exponential boundary must match) — both the Rust and Go implementations do. This is the one place the spec is ECMAScript-anchored; everything else is language-neutral by construction.

## Installing

**TypeScript/JavaScript — References 2.0:**

```bash
npm install @limaformat/lima
# or
bun add @limaformat/lima
```

```ts
import { parse } from '@limaformat/lima'

const result = parse(input, { partials: { author: 'Ada' } })
// ${key} document references, $(key) partial references
```

**Rust — References 2.0:**

```bash
cargo add lima@0.6.0
```

```rust
use lima::{parse, ParseOptions};

let result = parse(input, ParseOptions::default())?;
// ${key} document references, $(key) partial references
```

**Go — References 2.0:**

```bash
go get github.com/limaformat/lima/go@v0.6.0
```

```go
import lima "github.com/limaformat/lima/go"

value, err := lima.Parse(input, lima.ParseOptions{})
// ${key} document references, $(key) partial references
```

See the [Guide](/docs/guide/) for the full TypeScript API, and [Migrating from YAML](/docs/migrating-from-yaml/) if you're moving existing frontmatter over.

## Editor support

A VS Code extension — `limaformat.vscode-lima` — adds syntax highlighting for `.lima` files and Markdown/MDX frontmatter, plus live diagnostics run through the bundled TypeScript parser. Published on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=limaformat.vscode-lima) and on [Open VSX](https://open-vsx.org/extension/limaformat/vscode-lima) for VSCodium, Cursor, and other compatible editors.
