+++
title = "A Pass-Order Study in Tubular"
date = 2025-10-28
description = "Study of pass order sensitivity in Tubular: experiment design, data pipeline, and key findings."

[taxonomies]
tags = ["WASM", "Compiler", "Research"]

[extra]
image = "images/pass-order-hero.png"
image_credit = "Aditya Prashant Chaudhari"
+++

# Designing and Executing a Pass-Order Study in Tubular

Technical report: [link](https://drive.google.com/file/d/1l2euVHNgPHo4V_RDMbIrIy_qi7EYpVuD/view?usp=sharing)

This post documents the research process behind my recent exploration of optimization pass ordering in Tubular, a
small compiler that emits WebAssembly Text (WAT), I originally built for my class CSE 450, but kept developing it-adding optimization passes, configurable pass ordering, and the data pipelines described here. The accompanying report contains all tables and quantitative results; here I focus on the methodology—how the compiler and experiments were designed, how the data pipeline evolved, and what lessons emerged about making self-driven research reproducible.

## 1. Motivation and Scope

Tubular began as a teaching project: a C++20 implementation of the classic frontend–middle–backend pipeline for a
simple imperative language. Once the core pipeline was stable (lexer, parser, type system, WAT generator), I added
three optimization passes:

- FunctionInliningPass (small/pure functions),
- LoopUnrollingPass (affine while loops with literal bounds), and
- TailRecursionPass (loopification via a dedicated ASTNode_TailCallLoop).

Each pass worked in isolation, but I wanted to replicate a long-standing observation from production compilers: the
order in which passes run can influence the final code. Rather than rely on anecdotes, I decided to quantify that
effect in Tubular’s controlled setting.

Research question:

> When does the ordering of inlining, unrolling, and tail recursion elimination matter for small WebAssembly kernels,
> and by how much?

## 2. Building the Experimental Substrate

### 2.1 Configurable Pass Ordering

I introduced a --pass-order=inline,unroll,tail flag (arbitrary permutation) and refactored
`Tubular::RunOptimizationPasses` to schedule passes dynamically. This required:

- A shared AST cloner (src/core/ASTCloner.hpp) capable of deep-copying every node type.
- Defensive pass implementations (e.g., unroll respects break/continue, inliner clones call arguments cautiously).
- A CLI parser that validates permutations and meaningful combinations (--unroll-factor, --no-inline, --tail=off).

### 2.2 Curated Benchmark Suite

To probe distinct behaviors, I created ten workloads under research_tests/, each returning a deterministic integer:

1. recursive Fibonacci (rt01),
2. tail-recursive factorial (rt02),
3. simple loop summation (rt03),
4. stride-heavy helper loop (rt04),
5. nested loop mix (rt05),
6. string wrapping with helper calls (rt06),
7. helper-heavy arithmetic loop (rt07),
8. branchy loop with continue (rt08),
9. matrix-style nested loop (rt09), and
10. a control baseline (rt10).

Each benchmark got a plain-text comment documenting the expected output. The manifest (research_tests/config.json)
ties benchmarks to expected values, optimization variants, and pass orders.

### 2.3 Automation Infrastructure

I wrote two scripts:

- scripts/collect_data.py: rebuilds Tubular, runs the legacy regression suite, executes every benchmark/variant/order
  combination with warm-ups and timed runs, and writes artifacts/research/results.csv + summary.json.
- scripts/repeat_collection.py: orchestrates multiple runs (default 3), storing each run in artifacts/research/
  batch_runs/runN/ with logs and metadata.

Key design decisions:

- Warm-up iterations precede timing to avoid cold-start bias.
- Node.js executes .wasm outputs because it’s easy to script, but the framework is runtime-agnostic.
- Runs are verbose by default ([RUN …] / [OK …]) so long sweeps show progress and become easier to debug.

## 3. From Single Runs to Robust Data

### 3.1 First Iteration: Single Sweep

Initially I built the pipeline with 5 timed runs per configuration. It quickly highlighted order-dependent spikes
(nested loops, helper-heavy workloads), but conclusions felt brittle. Repeating the sweep manually showed some order
swaps, suggesting more samples were needed.

### 3.2 Scaling Up

I changed the manifest to runs=50, warmup_runs=10. Each sweep now executes 360 combinations × 50 runs = 18,000 timed
executions. Runtime per sweep went from ~2 minutes to ~10 minutes, still manageable.

### 3.3 Multi-Run Validation

With scripts/repeat_collection.py --runs 3, I ran the full pipeline three times (each including the regression suite).
Post-run analysis showed:

- Best-order medians vary only ~0.33 ms on average (max ~1.34 ms).
- Worst-order medians vary ~0.49 ms on average.
- The absolute gaps are small, but they’re enough for the “winning” order to flip between runs when the contenders are
  separated by tenths of a millisecond.

Rather than chase a single “true” ordering, I normalized by computing regret: for each row (benchmark, variant,
run), the percentage above that row’s best-order median. That provided a risk profile per order (mean, median, 95th
percentile).

## 4. Analysis Approach

### 4.1 Regret Rather Than Absolute Time

Absolute medians across orders differ by only ~0.25 % on average. Regret (excess percentage vs. per-row best) is more
informative when ranking orders. I plotted the empirical CDF: inline → tail → unroll consistently has the lowest mean
and 95th percentile regret, making it the best “fixed” order for risk-averse tuning.

### 4.2 Win Shares and Dominance

To capture “who wins where,” I computed win shares per benchmark/order and produced stacked bar charts. Some
benchmarks (e.g., rt01-fib-recursive) showed fragmented shares, implying no stable order; others (e.g., rt05-nested-
mix) had a clear dominant color.

I also calculated a “dominance score”: fraction of wins captured by the best order for each benchmark. Long bars =
robust winners; short bars = contested cases.

### 4.3 Sensitivity by Unroll Factor

By slicing rows by --unroll-factor, I found distribution medians rising with the factor: unroll-8 cases showed larger
best–worst gaps than unroll-4 or no unrolling. A violin plot captured this visually.

### 4.4 Static Feature Correlation

Using the feature table, I inspected patterns:

- Tail recursion (rt02) prefers orders that loopify before unrolling.
- Nested loops (rt05, rt09) lean toward inline-first sequences.
- Branch-heavy loops (rt08) favor tail-first ordering to simplify control before unrolling.

This hints that even simple static features can guide pass selection, a good direction for “future work.”

## 5. Reproducibility Checklist

All artifacts mentioned in the report live in Git:

- Benchmarks: research_tests/\*.tube
- Scripts: scripts/collect_data.py, scripts/repeat_collection.py
- Raw data: artifacts/research/batch_runs/run\*/{summary.json, results.csv, collect.log}
- Aggregated metrics: artifacts/research/aggregated_metrics.json
- Tables for the report: docs/figures/\*.csv
- LaTeX report: docs/technical_report.tex.

Re-run the experiment in one command:

python3 scripts/collect_data.py

Steamroll the entire batch (three runs):

./scripts/repeat_collection.py --runs 3

Everything is self-contained: the technical report references the scripts and directories explicitly for reviewers.

## 6. Lessons Learned

1. Automate early. The first version used manual scripts; rerunning by hand highlighted the need for collect_data.py
   and verbose logging.
2. Sample heavily. With only five runs per configuration, outliers dominated. Jumping to 50 runs smoothed noise and
   made regret analysis meaningful.
3. Normalize comparisons. Regret (and win shares) communicate risk better than absolute medians.
4. Correlate with structure. Static features—loop depth, tail recursion, branching—provided intuitive explanations for
   the observed “winners.”
5. Version everything. Raw and aggregated data are stored alongside code; the report is reproducible down to the CSV
   tables.

## 7. Future Directions

- External runtimes: Replicate results under Wasmtime (AOT + JIT) to see if host optimizations change the order
  rankings.
- Additional passes: Introduce dead-code elimination or common subexpression elimination to see if the “robust” order
  persists.
- Feature-driven selection: Train a simple heuristic or classifier on the existing dataset to choose pass order per
  benchmark.
- Longer kernels: Port the methodology to larger programs or real workloads to test scalability.

For the full quantitative treatment (regret CDFs, stacked win-share bars, unroll-factor vioplots, and detailed
tables), see the technical report (docs/technical_report.pdf). All code, data, and plots live in the repository
(https://github.com/AdityaC4/tubular-upgrade).
