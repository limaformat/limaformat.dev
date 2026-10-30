---
title: Packages
description: Three published implementations of Lima Core and References, verified against the same language-neutral conformance corpus.
urlPath: /packages/
template: doc
type: page
---
Lima's normative specifications are written to be implementation-language-agnostic: an independent implementation can follow the specs directly without reading another binding's source. TypeScript is the reference implementation; Rust and Go independently implement the same Lima Core and Lima References semantics. All three are checked against the same language-neutral [conformance corpus](/conformance/) rather than carrying their own interpretations of edge cases.

## History

The table above gives the current versions and figures, measured from the Lima repository at the version this site shows.

Lima Core 1.0 was frozen; corrections shipped only as additive errata revisions (through 1.0.10), driven by the conformance corpus rather than a single implementation's convenience, and never altering the byte-frozen 1.0.0 baseline. Core 1.1 (2026-10-28) was the first change an erratum could not carry: strict mode rejects a content line that belongs to no structure, and Core 1.1 settles cases Core 1.0 left open, such as a sequence at its key's own column. Core 1.2 lets an unquoted key be written in any script, and gendered (`größe`, `題名`, `autor*in`), and states what each kind of line does where it stands in one table. Lima References 2.0 was final as of 2026-08-12; References 2.1 reaches the keys Core 1.2 admits.

An earlier References 1.0 was published briefly in mid-2026 and superseded almost immediately by References 2.0, which is not syntax-compatible with it. Its [archived specification](/docs/references-1-spec/) and 101-case regression corpus stay in the repository; it is not a current target.

## Why TypeScript first

Lima's own tooling — the site generator this documentation is built with, and the broader author ecosystem it grew out of — is Bun/TypeScript-native, so the reference implementation started there. That's a starting point, not a ceiling: the specs don't privilege JavaScript semantics anywhere except one explicitly documented, narrow exception.

**Float serialisation** (References §3.5.1) is normatively anchored to the ECMAScript `Number::toString` algorithm, including its fixed-vs-exponential thresholds — a deliberate trade-off for cross-language output parity. Any other implementation must reproduce those thresholds exactly (using Ryu or Dragonbox internally is fine; the digit sequence and fixed/exponential boundary must match) — both the Rust and Go implementations do. This is the one place the spec is ECMAScript-anchored; everything else is language-neutral by construction.

## Installing

**TypeScript/JavaScript:**

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

**Rust:**

```bash
cargo add lima
```

```rust
use lima::{parse, ParseOptions};

let result = parse(input, ParseOptions::default())?;
// ${key} document references, $(key) partial references
```

**Go:**

```bash
go get github.com/limaformat/lima/go@latest
```

```go
import lima "github.com/limaformat/lima/go"

value, err := lima.Parse(input, lima.ParseOptions{})
// ${key} document references, $(key) partial references
```

See the [Guide](/docs/guide/) for the full TypeScript API, and [Migrating from YAML](/docs/migrating-from-yaml/) if you're moving existing frontmatter over.

## Editor support

A VS Code extension — `limaformat.vscode-lima` — adds syntax highlighting for `.lima` files and Markdown/MDX frontmatter, plus live diagnostics run through the bundled TypeScript parser. Published on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=limaformat.vscode-lima) and on [Open VSX](https://open-vsx.org/extension/limaformat/vscode-lima) for VSCodium, Cursor, and other compatible editors.
