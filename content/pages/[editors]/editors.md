---
title: Editors
description: Editor integrations for Lima — a published VS Code extension, and a language server for everything else.
urlPath: /editors/
template: doc
type: page
---

Lima's editor support comes in two layers. The [VS Code extension](https://marketplace.visualstudio.com/items?itemName=limaformat.vscode-lima) is a published, self-contained integration — syntax highlighting and live diagnostics, no other install step. Every other editor below runs on `@limaformat/lima-language-server`, a [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) implementation any LSP-capable editor can talk to, instead of a bespoke integration per editor.

## Status

- VS Code extension — published on the Marketplace and Open VSX, `limaformat.vscode-lima`.
- Language server — published as `@limaformat/lima-language-server` on npm. Diagnostics, hover, and go-to-definition for `${key}` document references in standalone `.lima` files and, where an editor's LSP client routes them, Markdown/MDX frontmatter blocks.
- Syntax highlighting outside VS Code — shipped for Sublime Text and Emacs (hand-written grammars) and for Neovim, Helix, and Zed (a shared [tree-sitter-lima](https://github.com/limaformat/lima/tree/main/editors/tree-sitter-lima) grammar). JetBrains has no Lima-specific grammar yet; diagnostics still work there, they just show as unstyled squiggles.
- Hover and go-to-definition — work for `${key}` document references, which resolve entirely within the current document. `$(key)` partial references get an explanatory hover only, never a jump target: the spec leaves where a partial lives entirely up to the caller's own code, so no editor can generically resolve one.

## Setup

Full, copy-pasteable configuration for every editor listed above — Neovim, Helix, Sublime Text, JetBrains, and Emacs via eglot — lives in the language server's own [README](https://github.com/limaformat/lima/tree/main/editors/lsp). This page tracks what's available where; that README has the exact commands, kept in one place so they don't drift from what the server actually supports.

Zed and JetBrains each have a dedicated companion — a [Zed extension](https://github.com/limaformat/lima/tree/main/editors/zed) and a [JetBrains plugin](https://github.com/limaformat/lima/tree/main/editors/jetbrains) — that register the language server without hand-editing a generic-server config. Neither is published to its marketplace yet, so both install from a checkout for now.
