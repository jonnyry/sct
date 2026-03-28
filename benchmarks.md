# benchmarks

> last updated: 2026-03-28

## results

| operation | sct (local) | ± | fhir (remote) | ± | speedup |
|:---|---:|---:|---:|---:|:---|
| concept lookup | 1 ms | ±0 ms | 131 ms | ±0 ms | **131× faster** |
| text search (top 10) | 1 ms | ±0 ms | 171 ms | ±0 ms | **171× faster** |
| direct children | 1 ms | ±0 ms | 132 ms | ±0 ms | **132× faster** |
| ancestor chain (depth ~12) | 2 ms | ±0 ms | 1100 ms [1] | ±81 ms | **550× faster** |
| subsumption test | 1 ms | ±81 ms | 134 ms [2] | ±81 ms | **134× faster** |
| bulk lookup (15 concepts) | 1 ms | ±81 ms | 2526 ms [3] | ±233 ms | **2526× faster** |
| **total** | **7 ms** | | **4194 ms** | | **599× faster** |

remote: https://terminology.openehr.org/fhir | ping: 190 ms | 5 runs (+1 warmup) | hyperfine 1.20.0

## notes

- [1] 6 sequential $lookup calls (one per IS-A hop)
- [2] positive case (T2DM subsumes DM); false cases are similar cost
- [3] server does not support FHIR batch; 15 sequential $lookup calls issued

## environment

| | |
|:---|:---|
| sct version | sct 0.2.0 |
| snomed version | 20260311 |
| concept count | 831,132 |
| sqlite3 version | 3.51.2 |
| os | Linux 6.17.0-14-generic |

_times are wall-clock median; local times include sqlite3 process startup._
