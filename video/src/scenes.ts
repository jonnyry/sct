// All scenes derived from docs/walkthrough.md
// durationInFrames assumes 30fps: 150 = 5s, 180 = 6s, 210 = 7s, 240 = 8s

export type Scene =
  | { type: 'title'; id: string; title: string; subtitle: string; tagline: string; durationInFrames: number }
  | { type: 'bullets'; id: string; section: string; title: string; bullets: string[]; durationInFrames: number }
  | { type: 'code'; id: string; section: string; title: string; code: string; note?: string; durationInFrames: number }
  | { type: 'diagram'; id: string; section: string; title: string; diagram: string; bullets: string[]; durationInFrames: number }
  | { type: 'table'; id: string; section: string; title: string; headers: string[]; rows: string[][]; durationInFrames: number };

export const SCENES: Scene[] = [
  // ── Title ──────────────────────────────────────────────────────────────────
  {
    type: 'title',
    id: 'title',
    title: 'sct',
    subtitle: 'SNOMED CT · local-first toolchain',
    tagline: 'A single Rust binary. Offline. No server. No Java.',
    durationInFrames: 150,
  },

  // ── 0 What is sct? ────────────────────────────────────────────────────────
  {
    type: 'diagram',
    id: 'pipeline',
    section: '0',
    title: 'What is sct?',
    diagram: [
      'SNOMED RF2 release',
      '        │',
      '        ▼',
      '   sct ndjson          ← build once per release',
      '        │',
      '        ├──▶ sct sqlite    →  snomed.db',
      '        ├──▶ sct parquet   →  snomed.parquet',
      '        ├──▶ sct markdown  →  snomed-concepts/',
      '        └──▶ sct embed     →  snomed-embeddings.arrow',
      '                                   │',
      '                             sct mcp   →  Claude',
    ].join('\n'),
    bullets: [
      'Offline at query time',
      'Deterministic — same RF2 + locale = identical output',
      'Single portable file for each artefact',
    ],
    durationInFrames: 270,
  },

  // ── 1 Installation ────────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'install',
    section: '1',
    title: 'Installation',
    code: [
      'git clone https://github.com/your-org/sct && cd sct',
      'cargo install --path . --features "tui gui"',
      '',
      '# Verify',
      'sct --version',
      '# sct 0.3.4',
      '',
      '# Shell completions',
      'sct completions bash > ~/.local/share/bash-completion/completions/sct',
    ].join('\n'),
    durationInFrames: 150,
  },

  // ── 2 Getting RF2 Data ────────────────────────────────────────────────────
  {
    type: 'bullets',
    id: 'rf2-data',
    section: '2',
    title: 'Getting SNOMED RF2 Data',
    bullets: [
      'UK edition (recommended): UK Monolith from NHS TRUD',
      '  Includes: International + UK Clinical extension + dm+d drugs',
      '  Monolith (item 105) is preferred — single zip, pre-merged',
      'International edition: Download from SNOMED MLDS',
      'IPS Free Set: Available without affiliate membership',
      'sct accepts ZIP files or extracted directories',
    ],
    durationInFrames: 180,
  },

  // ── 3 Layer 1: NDJSON ─────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'ndjson',
    section: '3',
    title: 'Layer 1 — sct ndjson',
    code: [
      '# UK edition: layer International + UK Clinical + dm+d',
      'sct ndjson \\',
      '  --rf2 SnomedCT_InternationalRF2_PRODUCTION_*.zip \\',
      '  --rf2 SnomedCT_UKClinicalRF2_PRODUCTION_*.zip \\',
      '  --rf2 SnomedCT_UKDrugRF2_PRODUCTION_*.zip \\',
      '  --locale en-GB \\',
      '  --output snomed-uk-20250301.ndjson',
      '',
      '# 831k concepts → ~1.1 GB NDJSON in ~30 s',
    ].join('\n'),
    note: 'One JSON object per line. Version-controlled. Copyable. Diffable.',
    durationInFrames: 180,
  },

  // ── 4 SQLite ──────────────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'sqlite',
    section: '4',
    title: 'Layer 2a — SQLite + Full-Text Search',
    code: [
      'sct sqlite --input snomed.ndjson --output snomed.db',
      '# ~11 s → 1.3 GB SQLite file',
      '',
      '# Full-text search (FTS5)',
      'sqlite3 snomed.db \\',
      '  "SELECT id, preferred_term FROM concepts_fts',
      '   WHERE concepts_fts MATCH \'heart attack\' LIMIT 5"',
      '',
      '# Or use sct lexical directly',
      'sct lexical --db snomed.db "heart attack" --limit 10',
      'sct lexical --db snomed.db "amox*"        # prefix search',
    ].join('\n'),
    durationInFrames: 210,
  },

  // ── 4a CTV3 crossmaps ─────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'ctv3',
    section: '4a',
    title: 'UK Crossmaps — CTV3',
    code: [
      '# Forward: SNOMED → CTV3',
      'sqlite3 snomed.db "SELECT id, preferred_term, ctv3_codes',
      '  FROM concepts WHERE id = \'22298006\'"',
      '# 22298006|Myocardial infarction|["X200E"]',
      '',
      '# Reverse: CTV3 code → SNOMED concept',
      'sqlite3 snomed.db "',
      '  SELECT c.id, c.preferred_term',
      '  FROM concepts c JOIN concept_maps m ON c.id = m.concept_id',
      '  WHERE m.code = \'X200E\' AND m.terminology = \'ctv3\'"',
    ].join('\n'),
    note: 'Also available via the snomed_map MCP tool for Claude.',
    durationInFrames: 180,
  },

  // ── 5 Parquet ─────────────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'parquet',
    section: '5',
    title: 'Layer 2b — Parquet for Analytics',
    code: [
      'sct parquet --input snomed.ndjson --output snomed.parquet',
      '# ~5 s → 824 MB',
      '',
      'duckdb -c "',
      '  SELECT hierarchy, COUNT(*) AS n',
      '  FROM \'snomed.parquet\'',
      '  GROUP BY hierarchy ORDER BY n DESC LIMIT 10"',
      '',
      '# Python / pandas',
      'import pandas as pd',
      'df = pd.read_parquet("snomed.parquet")',
    ].join('\n'),
    durationInFrames: 150,
  },

  // ── 6 Markdown ────────────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'markdown',
    section: '6',
    title: 'Layer 2c — Markdown for RAG',
    code: [
      'sct markdown --input snomed.ndjson --output ./snomed-concepts/',
      '# ~15 s → 831k .md files, 3.2 GB total',
      '',
      '# Hierarchy mode — ~19 files, one per top-level hierarchy',
      'sct markdown --input snomed.ndjson \\',
      '             --output ./snomed-hierarchies/ \\',
      '             --mode hierarchy',
      '',
      '# Search with ripgrep',
      'rg "finding_site.*heart" snomed-concepts/ -l | head -5',
    ].join('\n'),
    note: 'Read directly by Claude Code, indexed by your own RAG pipeline.',
    durationInFrames: 150,
  },

  // ── 7 Embeddings ──────────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'embed',
    section: '7',
    title: 'Layer 3 — Vector Embeddings',
    code: [
      '# Requires Ollama running locally',
      'ollama pull nomic-embed-text',
      '',
      'sct embed \\',
      '  --input snomed.ndjson \\',
      '  --output snomed-embeddings.arrow \\',
      '  --model nomic-embed-text',
    ].join('\n'),
    note: 'Streams to Arrow IPC file. Queryable with DuckDB or PyArrow.',
    durationInFrames: 150,
  },

  // ── 8 Semantic Search ─────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'semantic',
    section: '8',
    title: 'Semantic Search',
    code: [
      'sct semantic --embeddings snomed-embeddings.arrow \\',
      '             "blocked coronary artery" --limit 5',
      '',
      '# 5 closest concepts:',
      '#   0.9340  [22298006] Myocardial infarction',
      '#   0.9210  [44771008] Coronary artery occlusion',
      '#   0.9080  [394659003] Acute coronary syndrome',
      '#   0.8970  [414795007] Ischaemic heart disease',
      '#   0.8810  [53741008] Coronary artery atherosclerosis',
    ].join('\n'),
    note: 'Finds concepts even when exact terms don\'t match — typos, synonyms, natural language.',
    durationInFrames: 180,
  },

  // ── 9 MCP Server ──────────────────────────────────────────────────────────
  {
    type: 'bullets',
    id: 'mcp',
    section: '9',
    title: 'Layer 4 — MCP Server for Claude',
    bullets: [
      'sct mcp --db snomed.db  →  stdio MCP server, < 5 ms startup',
      'snomed_search — free-text FTS5 search',
      'snomed_concept — full concept detail by SCTID',
      'snomed_children / snomed_ancestors — IS-A hierarchy traversal',
      'snomed_hierarchy — all concepts in a top-level hierarchy',
      'snomed_map — SNOMED ↔ CTV3 bidirectional lookup (UK only)',
      'snomed_semantic_search — nearest-neighbour (requires --embeddings)',
    ],
    durationInFrames: 210,
  },

  // ── 10 Interactive UIs ────────────────────────────────────────────────────
  {
    type: 'bullets',
    id: 'ui',
    section: '10',
    title: 'Interactive UIs',
    bullets: [
      'sct tui --db snomed.db  →  three-panel terminal UI',
      '  Top-left: Hierarchy browser',
      '  Bottom-left: Search box + results',
      '  Right: Full concept detail',
      '  Keybindings: / search · Tab panels · ↑↓ navigate · q quit',
      'sct gui --db snomed.db  →  opens http://127.0.0.1:8420',
      '  Tabs: Detail · Graph (D3 force-directed) · Hierarchy',
      '  Localhost only — never network-accessible',
    ],
    durationInFrames: 210,
  },

  // ── 11 sct diff ───────────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'diff',
    section: '11',
    title: 'Release Comparison — sct diff',
    code: [
      'sct diff \\',
      '  --old snomed-uk-20240901.ndjson \\',
      '  --new snomed-uk-20250301.ndjson \\',
      '  --format summary',
      '# Reports: added · inactivated · terms changed · hierarchy changed',
      '',
      '# Machine-readable output for scripting',
      'sct diff --old old.ndjson --new new.ndjson --format ndjson | \\',
      '  jq \'select(.change_type == "term_changed")\'',
    ].join('\n'),
    durationInFrames: 150,
  },

  // ── 13 Performance ────────────────────────────────────────────────────────
  {
    type: 'table',
    id: 'performance',
    section: '13',
    title: 'Performance — UK Monolith (831k concepts, NVMe SSD)',
    headers: ['Operation', 'Time', 'Output size'],
    rows: [
      ['RF2 → NDJSON', '~30 s', '~1.1 GB'],
      ['NDJSON → SQLite', '~11 s', '1.3 GB'],
      ['NDJSON → Parquet', '~5 s', '824 MB'],
      ['NDJSON → Markdown', '~15 s', '3.2 GB (831k files)'],
      ['MCP server startup', '< 5 ms', '—'],
      ['vs remote FHIR server', '50–2700× faster', '—'],
    ],
    durationInFrames: 180,
  },

  // ── 14a Code Lists ────────────────────────────────────────────────────────
  {
    type: 'code',
    id: 'codelist',
    section: '14a',
    title: 'Code Lists — sct codelist',
    code: [
      '# Scaffold a new codelist',
      'sct codelist new codelists/asthma-diagnosis.codelist \\',
      '  --title "Asthma diagnosis" --author "Marcus Baw"',
      '',
      '# Add concepts (with all active descendants)',
      'sct codelist add codelists/asthma-diagnosis.codelist \\',
      '  195967001 389145006 --db snomed.db --include-descendants',
      '',
      '# Validate (CI-ready: exit 0 = warnings, exit 1 = errors)',
      'sct codelist validate codelists/asthma-diagnosis.codelist --db snomed.db',
      '',
      '# Export',
      'sct codelist export codelists/asthma-diagnosis.codelist \\',
      '  --format opencodelists-csv',
    ].join('\n'),
    note: 'Plain-text .codelist files with YAML front-matter — lives in git, reviewed like source code.',
    durationInFrames: 240,
  },

  // ── 15 Command Reference ──────────────────────────────────────────────────
  {
    type: 'table',
    id: 'commands',
    section: '15',
    title: 'Command Reference',
    headers: ['Command', 'Description'],
    rows: [
      ['sct ndjson', 'RF2 → canonical NDJSON (build once per release)'],
      ['sct sqlite', 'NDJSON → SQLite + FTS5 (SQL + full-text search)'],
      ['sct parquet', 'NDJSON → Parquet (DuckDB / analytics)'],
      ['sct markdown', 'NDJSON → Markdown files (RAG / file reading)'],
      ['sct embed', 'NDJSON → Arrow embeddings (requires Ollama)'],
      ['sct mcp', 'Stdio MCP server for Claude (wraps SQLite)'],
      ['sct lexical', 'Keyword search via FTS5'],
      ['sct semantic', 'Semantic search via cosine similarity'],
      ['sct diff', 'Compare two NDJSON releases'],
      ['sct info', 'Inspect any sct-produced artefact'],
      ['sct tui / gui', 'Terminal UI / Browser UI'],
      ['sct codelist', 'Build, validate, export code lists'],
    ],
    durationInFrames: 270,
  },
];

// Pre-compute frame offsets so Walkthrough.tsx can just map over this
export type SceneWithOffset = Scene & { from: number };

export const SCENES_WITH_OFFSETS: SceneWithOffset[] = SCENES.reduce<SceneWithOffset[]>(
  (acc, scene) => {
    const from = acc.length > 0 ? acc[acc.length - 1].from + SCENES[acc.length - 1].durationInFrames : 0;
    return [...acc, { ...scene, from }];
  },
  []
);

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.durationInFrames, 0);
