# sct

A fast, local-first SNOMED CT toolkit built in Rust and designed for local development and data exploration.

Convert SNOMED-CT releases in RF2 format to NDJSON, and from there to SQLite, Parquet, Markdown, and Arrow embeddings — no server required.

Includes a TUI (Terminal User Interface) for exploring the data, and a web GUI for visualizing relationships between concepts.

Fast, local MCP (Model Context Protocol) server means you can hook SNOMED-CT up to Claude Code and other LLMs right on your machine, and use it for data exploration, code generation, and more.

- [Walkthrough](walkthrough.md) — a hands-on tour of all features
- [UK Edition structure](uk-edition-structure.md) — plain-English guide to NHS TRUD downloads, RF2 layout, and file naming
- [Why build this?](why-build-this.md) — the case against always reaching for a terminology server
