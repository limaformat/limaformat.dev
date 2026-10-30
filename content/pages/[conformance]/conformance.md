---
title: Conformance
description: Language-neutral conformance suites for Lima Core and References, passed by TypeScript, Rust, and Go, plus a differential test of all three.
urlPath: /conformance/
template: doc
type: page
---
One of the standing criticisms of YAML is that different implementations routinely disagree with each other on ambiguous edge cases. Lima addresses this directly with a shared, implementation-independent **conformance corpus**, rather than tests written informally by each implementation's own author. Its suites and their cases are in the table above, counted from the repository at the version this site shows; TypeScript, Rust, and Go pass every case against the same expectations.

```bash
# from corpus/runner/
bun run run                 # every Core and References suite
bun run run:references-2    # References 2.0 alone
```

## What's in it

- A **byte-frozen Core 1.0.0 baseline** — count-pinned by a test and byte-protected by checked-in content-hash manifests so it cannot silently drift. Core 1.0 grew via additive errata revisions through 1.0.10; each added case carries a `since` marker and the baseline stays byte-identical.
- A frozen suite for Lima Core 1.1, pinned the same way. It supersedes 8 Core 1.0 cases, which stay in the 1.0 baseline as they are.
- A suite for Lima Core 1.2: keys in any script, and a case for every row of the table of what each kind of line does.
- Separate suites for Lima References 2.0 and 2.1, versioned independently and run on their own.
- Every case has exactly one expectation kind: a successful **result**, a thrown **error**, or **warnings** alongside a result.
- Case IDs are permanently stable and follow a fixed scheme:

```text
core.numbers.safe-integer.maximum
core.strings.unknown-escape.strict
references-2.chains.maximum.three-edges-allowed
references-2.block-scalar.continuation.token-physical-line
```

Renaming an ID is treated as a corpus change, not a cosmetic edit.

An earlier **References 1.0** was published briefly in mid-2026 and superseded almost immediately by References 2.0, which is deliberately not syntax-compatible with it. Its specification stays [archived](/docs/references-1-spec/) and its 101 frozen cases still run in CI as a regression guard on internal code — but it is not a target current implementations are asked to hit, and it is not counted here.

## Why JSON, not YAML or Lima itself

The corpus format had to avoid two traps: describing tests in YAML would introduce YAML-native type semantics into what's supposed to be a language-neutral contract, and describing them in Lima would be circular — the parser under test would be loading its own test definitions. JSON describes the test contract; the Lima input itself stays verbatim, either inline as a JSON string or, when that would hurt readability, in a `.lima` sidecar file.

## Comparing by code, not by message text

Lima exposes a small, structured error API, and the corpus compares against it — not against full English error strings, which would tie every implementation to the exact wording of a TypeScript-first reference implementation.

```ts
type LimaDiagnosticCode =
  | "INVALID_ESCAPE"
  | "INVALID_QUOTE"
  | "INVALID_DATE"
  | "INVALID_NUMBER"
  | "INVALID_REFERENCE_SHAPE"
  | "INVALID_INDENTATION"
  | "UNRECOGNIZED_LINE"
  | "INVALID_FLOW_SYNTAX"
  | "DUPLICATE_KEY"
  | "RESOURCE_LIMIT"
  | "UNRESOLVED_REFERENCE"
  | "INVALID_INTERPOLATION"
  | "INVALID_PARTIAL"
```

A diagnostic case compares the fields that are actually normative — `code`, `line`, and where relevant `column`, `token`, `key`, `partial`, `path` — never the prose message.

## Language-neutral values

Host-language values that JSON can't natively express — a UTC instant, `NaN`, `-0`, an intentionally invalid or out-of-range date — are represented as typed corpus values (e.g. `{ "$type": "instant", "value": "2024-03-01T09:00:00Z" }`) that each runner materializes into its own native representation. This keeps a boundary case reproducible across runners instead of depending on how, say, JavaScript's `Date` and a Rust date crate each happen to parse an arbitrary string.

## Boundary values are generated, not hand-typed

Cases near a resource limit (§9 of Core, §6.2 of References) are produced by small, deterministic generators rather than pasted in by hand — a 16,385-code-point scalar or a 4,096-node partial is exactly the kind of input nobody should be hand-writing into a fixture file. Every generator is documented and reproducible across runners; generator semantics are part of the corpus contract itself.

## Beyond the cases: a differential test

A corpus pins what someone thought of. In every CI run, TypeScript, Rust, and Go also parse the same random documents — half nested the way front matter is and then disturbed, half random lines, some at a resource limit — in both modes, and must agree on every value, every warning, and every error code and line. A disagreement is a defect in one implementation or a place the specification leaves open; once decided, it becomes a corpus case. Agreement is not correctness, though: three implementations can share a mistake, which is why the corpus stays the contract.

## Where this is going

The corpus is organized as versioned, independently runnable conformance targets, not one ever-growing pile of cases: the suites in the table above. TypeScript (`@limaformat/lima`), Rust (`lima`), and Go (`github.com/limaformat/lima/go`) all pass them against exactly the same expectations, the References suites through their public References APIs.

The suites remain separate conformance targets rather than one growing specification version. An implementation may legitimately claim Lima Core without claiming References. See [Packages](/packages/) for implementation status per binding.

The full corpus, its schema, and the coverage matrices live in the repository: [`corpus/`](https://github.com/limaformat/lima/tree/main/corpus), design rationale in [`docs/corpus-design/`](https://github.com/limaformat/lima/tree/main/docs/corpus-design).
