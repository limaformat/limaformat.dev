#!/usr/bin/env bun
/**
 * spec-sync-check.ts — guards against drift between the normative specs in the
 * lima monorepo and the hand-maintained copies served on limaformat.dev.
 *
 * The site pages carry Lima frontmatter, an <h1> supplied by the template, a
 * blockquote-consolidated Status/Version/Date line, and site-only editorial
 * notes (archive banners, "on an early 1.0?"). None of that is normative. This
 * script normalises both sides down to the normative body — headings, prose,
 * lists, tables, grammar — and reports whatever still differs.
 *
 * Normalisation (applied to BOTH sides, deliberately lossy):
 *   - YAML frontmatter removed
 *   - a leading <h1> ("# …") removed
 *   - blockquote lines ("> …") removed          (site editorial framing)
 *   - standalone "**Status:** / **Version:** / **Date:**" lines removed
 *   - horizontal rules ("---", "***", "___") removed
 *   - table rows normalised: delimiter cells -> "---", content cells trimmed
 *   - inline markers stripped: **bold**, *italic*, `code`
 *   - backslash escapes of markdown punctuation removed ("2\.0" -> "2.0")
 *   - trailing whitespace trimmed; blank lines dropped for the comparison
 *
 * Leading indentation is NOT normalised: a nested list item indented 2 spaces
 * in one copy and 3 in the other is a real formatting divergence and the site
 * copy should match the normative source exactly.
 *
 * Exit 0 = in sync · 1 = drift (unified diff printed) · 2 = setup error.
 *
 *   bun scripts/spec-sync-check.ts
 *
 * Monorepo location: $LIMA_MONOREPO, else ../../../dev/lima/monorepo relative
 * to this repo root.
 */

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SITE_ROOT = resolve(import.meta.dir, "..");
const MONOREPO =
  process.env.LIMA_MONOREPO ?? resolve(SITE_ROOT, "../../../dev/lima/monorepo");

/** site copy  <->  normative source */
const PAIRS: Array<{ label: string; site: string; repo: string }> = [
  {
    label: "Core 1.1",
    site: "content/pages/[core-spec]/core-spec.md",
    repo: "docs/lima-core-1.0-spec.md",
  },
  {
    label: "References 2.0",
    site: "content/pages/[references-spec]/references-spec.md",
    repo: "docs/lima-references-2.0-spec.md",
  },
  {
    label: "References 1.0 (archived)",
    site: "content/pages/[references-1-spec]/references-1-spec.md",
    repo: "docs/lima-references-1.0-spec.md",
  },
];

function normalise(src: string): string {
  let text = src.replace(/\r\n/g, "\n");

  // 1. YAML frontmatter
  if (text.startsWith("---\n")) {
    const end = text.indexOf("\n---\n", 4);
    if (end !== -1) text = text.slice(end + 5);
  }

  const out: string[] = [];
  for (let raw of text.split("\n")) {
    let line = raw.replace(/\s+$/, "");

    if (/^#\s+\S/.test(line) && out.length === 0) continue; // leading H1
    if (/^>\s?/.test(line)) continue; // blockquote (site framing)
    if (/^\*\*(Status|Version|Date):\*\*/.test(line)) continue; // repo header
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) continue; // horizontal rule

    // table rows: collapse the delimiter row, trim every cell
    // A pipe inside a code span is content, escaped (the GFM source) or not (the site's Markanto, which reads a
    // code span whole and would show the backslash), so it is shielded before the row is split.
    if (/^\|.*\|$/.test(line)) {
      const shielded = line.replace(/`[^`]*`/g, (code) => code.replace(/\\\|/g, "|").replace(/\|/g, "\u0000"));
      const cells = shielded.slice(1, -1).split("|");
      const isDelim = cells.every((c) => /^\s*:?-+:?\s*$/.test(c));
      line = ("|" + cells.map((c) => (isDelim ? "---" : c.trim())).join("|") + "|").replace(/\u0000/g, "|");
    }

    // inline emphasis / code markers — presentation, not normative content
    line = line
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\\([.\-|*_+#()\[\]`~<>])/g, "$1"); // md punctuation escapes

    if (line.trim() === "") continue; // drop blank lines for the comparison
    out.push(line.trimEnd());
  }
  return out.join("\n") + "\n";
}

let drift = false;
let missing = false;
const tmp = mkdtempSync(join(tmpdir(), "spec-sync-"));

for (const { label, site, repo } of PAIRS) {
  const sitePath = join(SITE_ROOT, site);
  const repoPath = join(MONOREPO, repo);

  if (!existsSync(sitePath) || !existsSync(repoPath)) {
    missing = true;
    console.log(`?  ${label}`);
    if (!existsSync(sitePath)) console.log(`   site copy not found: ${sitePath}`);
    if (!existsSync(repoPath)) console.log(`   normative spec not found: ${repoPath}`);
    continue;
  }

  const a = normalise(readFileSync(repoPath, "utf8"));
  const b = normalise(readFileSync(sitePath, "utf8"));

  if (a === b) {
    console.log(`OK ${label}`);
    continue;
  }

  drift = true;
  const fa = join(tmp, `${label.replace(/\W+/g, "_")}.normative`);
  const fb = join(tmp, `${label.replace(/\W+/g, "_")}.site`);
  writeFileSync(fa, a);
  writeFileSync(fb, b);
  const d = Bun.spawnSync([
    "diff", "-u",
    "--label", `normative/${repo}`,
    "--label", `site/${site}`,
    fa, fb,
  ]);
  console.log(`DRIFT ${label}`);
  console.log((d.stdout?.toString() ?? "").replace(/^/gm, "  ").trimEnd());
  console.log("");
}

if (missing) {
  console.error(
    `\nOne or more files were not found. Set LIMA_MONOREPO if the monorepo\n` +
      `is not at ${MONOREPO}.`,
  );
  process.exit(2);
}
if (drift) {
  console.error(`\nSpec drift detected. The normative spec in the monorepo wins:`);
  console.error(`fix the site copy, or land an authorised spec change and re-sync.`);
  process.exit(1);
}
console.log(`\nAll ${PAIRS.length} spec copies match their normative sources.`);
