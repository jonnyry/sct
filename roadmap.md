# SNOMED Local-First Tooling — Roadmap

Outstanding work and next steps. Completed milestones have been removed.

---

## In progress / near-term

### Distribution

- [ ] Publish to crates.io and document `cargo install sct`
- [ ] Add Windows x86_64 (`x86_64-pc-windows-msvc`) to the release CI matrix
- [ ] Homebrew formula for macOS one-liner install (`brew install sct`)
- [ ] SHA-256 checksums for NDJSON artefacts published alongside GitHub Releases

### Quality

- [ ] End-to-end integration test: RF2 → NDJSON → SQLite → MCP query (CI-runnable with the sample data already in the repo)
- [ ] Populate real benchmark timings in `BENCHMARKS.md` (currently TBD placeholders)
- [ ] Smoke test for `sct embed`: embed a handful of concepts, query for "heart attack", assert myocardial infarction concepts appear in top results

---

## Features

### `sct mcp` — semantic search tool

Add a `snomed_semantic_search` MCP tool that loads the Arrow IPC file produced by `sct embed` and returns the nearest-neighbour concepts for a natural-language query. The tool would embed the query via Ollama at call time and perform cosine similarity against the pre-built index.

- [ ] Accept an optional `--embeddings` flag pointing to a `.arrow` file
- [ ] Implement `snomed_semantic_search` tool (query text → top-N concepts by embedding similarity)
- [ ] Graceful degradation: if no `--embeddings` file is provided, the tool is simply not registered

### `sct diff` — compare two NDJSON artefacts

Compare two releases of the canonical artefact (e.g. 2025-01 vs 2026-01) and report:

- [ ] Concepts added since the previous release
- [ ] Concepts inactivated since the previous release
- [ ] Concepts whose preferred term changed
- [ ] Concepts whose hierarchy changed

Output as NDJSON (one diff record per changed concept) or as a human-readable Markdown summary.

### `sct info` — inspect an artefact

A quick introspection command for any `sct`-produced file:

- [ ] For `.ndjson`: print concept count, `schema_version`, hierarchy breakdown, source RF2 date (parsed from filename convention)
- [ ] For `.db`: print concept count, schema version, FTS row count, file size
- [ ] For `.arrow`: print embedding count, dimension, model name (if stored in metadata)

---

## Future / larger scope

- [ ] **TRUD integration** — `sct download` subcommand that authenticates with the NHS TRUD API and downloads the latest UK Monolith RF2 release automatically
- [ ] **History files** — parse RF2 history substitution tables to map inactivated concept IDs forward to their replacements; expose via `snomed_resolve` MCP tool
- [ ] **`sct serve`** — thin HTTP wrapper around the MCP tools for use cases that cannot use stdio transport (web apps, non-Claude AI clients)
- [ ] **Concept maps** — cross-map support: load SNOMED→ICD-10/OPCS-4 map files from RF2 and expose via `snomed_map` MCP tool
