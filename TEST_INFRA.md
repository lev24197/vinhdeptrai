# Programmatic Verification & QA Test Infrastructure

## Overview
This document details the automated testing architecture, test suites, execution commands, and verification benchmarks designed for **The Anki Dictionary Studio**.

The test infrastructure provides automated, reproducible verification across all core systems (1000 Topics Database, Anki 9-Column TSV Formatting, Google Cloud Audio Service, Vocabulary Practice Quiz Engine, Category Taxonomy, and Live Browser Zero Console Exception Auditing) ensuring **100% test pass rate** and **zero uncaught browser console exceptions**.

---

## 1. Test Architecture & Files

```
├── tests/
│   └── run_verification.html         # Standalone browser test harness with Neo-brutalist UI
├── run_verification.ps1              # Headless Chromium test runner script (PowerShell)
└── TEST_INFRA.md                     # Infrastructure architecture and audit documentation
```

### Key Components

1. **`tests/run_verification.html`**:
   - Fully standalone HTML test harness rendered with Neo-brutalist Tailwind styling matching the project aesthetics.
   - Loads core project engine scripts (`data.js`, `dashboard.js`, `quiz.js`, `studio.js`, `corpus.js`, `actions.js`).
   - Embeds a live iframe error audit trap for `index.html`.
   - Real-time KPI badges (Total, Passed, Failed, Duration), and expandable test cards.

2. **`run_verification.ps1`**:
   - PowerShell runner automating headless browser execution using Chrome or Microsoft Edge.
   - Automatically detects installed browser at standard x64 / x86 / LocalAppData paths.
   - Creates an isolated temporary browser profile (`--user-data-dir`) to prevent Chromium ProcessSingleton lock collisions when standard browser windows are open.
   - Executes with `--headless=new --disable-web-security --allow-file-access-from-files --dump-dom`.
   - Parses DOM dump to extract JSON test results, logs colorful test results per suite, verifies zero uncaught console exceptions on `index.html`, and verifies complete removal of legacy arena files.

---

## 2. Test Coverage Matrix

The test harness exercises all 5 core verification domains:

| Suite # | Domain | Test Count | Key Invariants Tested |
|---|---|:---:|---|
| **1** | Clean Architecture & Complete Elimination | 3 | Zero combat globals in window namespace, all 7 core modules loaded and verified, Audio Service URL configured to Google Cloud Run. |
| **2** | Anki 9-Column Specification & Formatting | 3 | Cloze deletion masking format `w____d`, Anki sound tags `[sound:word.mp3]`, TSV line parsing into 9 distinct columns. |
| **3** | Vocabulary Practice Quiz Engine | 3 | Web Audio API oscillator synthesis, question count selector (10/20/30), topic checkbox state management. |
| **4** | Category Detector & Topic Mapping | 1 | Semantic classification into food, travel, tech, business, health, nature domains. |
| **5** | Zero Console Exception & Live Page Audit | 2 | Zero uncaught page errors, live `index.html` iframe audit with 0 console errors/unhandled rejections. |

---

## 3. Execution Command

To run the verification test suite locally:
```powershell
powershell -ExecutionPolicy Bypass -File .\run_verification.ps1
```
Expected output:
```
================================================================================
  ALL VERIFICATION TESTS AND AUDITS PASSED WITH ZERO FAILURES! (EXIT 0)         
================================================================================
```
