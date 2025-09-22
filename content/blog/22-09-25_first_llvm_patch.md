+++
title = "My First LLVM Patch: Making AVX/AVX512 Subvector Insert Intrinsics `constexpr`"
date = 2025-09-22
description = "Me actually learning LLVM"

[taxonomies]
tags = ["LLVM", "clang"]

[extra]
image = "images/LLVM.png"
image_credit = "https://llvm.org/"
+++

Recently I had decided to contribute my first patch to LLVM &mdash; a small but surprisingly tricky update to enable `constexpr` support for AVX and AVX512 subvector insert intrinsics. The kind of patch where you think "how hard can this be?" and then two days later you're debugging vector lanes in an interpreter VM you didn't know existed.

## The Why

The goal: make intrinsics like `_mm256_insertf128_ps` usable in `constexpr` functions. These are commonly used in high-performance SIMD code, and enabling them in constant evaluation can help optimize compile-time expressions, especially when building vector tables or reshuffling constants.

## Trying it

I started with the most scientific approach available: I wrote a test case and waited for it to fail.

```cpp
constexpr __m256 result = _mm256_insertf128_ps(_mm256_setzero_ps(), _mm_set1_ps(1.0f), 1);
```

And thankfully it failed. The constant evaluator didn't know what to do with the builtin, and the interpreter threw up its hands, gracefully.

## The Real Work

To fix this, I had to teach both:

* `ExprConstant.cpp`: Clang's AST evaluator, used for folding during semantic analysis.
* `InterpBuiltin.cpp`: the bytecode interpreter, which runs `constexpr` code on a tiny VM. (the future)

The logic is the same in both:

1. Take the base and subvector.
2. Check that their sizes are compatible.
3. Compute the insertion offset using the immediate operand.
4. Copy over the subvector lane into the base.

It’s not hard logic. But LLVM’s interpreters work at a pretty low level, and everything is abstracted (you deal with `APValue` and `Pointer` wrappers, type metadata, etc). Every copy feels like handling memory with oven mitts.

{% mermaid() %}
flowchart LR
    A["_mm256_insertf128_ps(...) in user code"] --> B[Clang Parser]
    B --> C["AST: CallExpr to builtin wrapper"]
    C --> D{"Constant Evaluation?<br/>(in constexpr/constinit)"}
    D -- "No" --> E[Emit IR normally]
    D -- "Yes" --> F["ExprConstant.cpp<br/>VectorExprEvaluator::VisitCallExpr"]
    F --> G{Builtin supported?}
    G -- "Yes" --> H[Evaluate lanes, build APValue]
    H --> I[Constant-folded value available to Sema]
    G -- "No" --> J["Bytecode path:<br/>InterpBuiltin.cpp::interp_*"]
    J --> K["Execute on constexpr VM,<br/>produce APValue"]
    I --> L[CodeGen uses folded constant]
    K --> L
    subgraph "Headers / Builtins"
      M[BuiltinsX86.td maps intrinsics] --> N["clang/include/clang/Headers/..."]
    end
    M -.-> C
    N -.-> C
{% end %}

## BuiltinsX86.td: The Treasure Map

Adding a new builtin means updating `BuiltinsX86.td`. This file maps frontend-level intrinsics to backend builtins and includes type info, masks, variants, etc.

It took me a while to understand that I didn’t need to reimplement any masking behavior. I had assumed I would need to manually interpret the mask register (“if bit i is set, write lane i”), but it turns out Clang’s headers expand these into separate builtins entirely, and the mask is passed through as a normal argument. Huge relief.

## Testing (and some cleanup)

Originally I wrote a new file: `avx-insert-constexpr.cpp`. But I was gently nudged by reviewers to follow the existing structure and add tests in the appropriate `clang/test/CodeGen/X86` files.

So I did.

Over 40 new test cases, all using the `TEST_CONSTEXPR` macro to make sure the evaluation actually happens at compile time. Here's a representative one:

```c
// Yes, this is one line in the actual test
TEST_CONSTEXPR(match_v16si(_mm512_mask_inserti32x4(((__m512i)(__v16si){2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17}), (0x00F0), ((__m512i)(__v16si){2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17}), ((__m128i)(__v4si){20,30,40,50}), 1), 2, 3, 4, 5, 20, 30, 40, 50, 10, 11, 12, 13, 14, 15, 16, 17));
```

Simple, but satisfying.

## Review Feedback

Most of the comments were around naming (I had `DstVec`, `Dst`, `Result` all floating around with conflicting meanings) and LLVM's legendary formatting rules. There's a rule about 80 columns. It’s not just a suggestion.

```cpp
assert(SubElements != 0 && BaseElements != 0 && (BaseElements % SubElements) == 0);
```

That became:

```cpp
assert(SubElements != 0 && BaseElements != 0 &&
       (BaseElements % SubElements) == 0);
```

(The reviewers and the llvm bot *will* notice.)

## Merge!

Eventually, the reviewers signed off. CI passed. I rebased, squashed, and hit "Mark as ready". A few hours later, it was merged.

🎉 First LLVM patch in!

PR: [llvm/llvm-project/pull/158778](https://github.com/llvm/llvm-project/pull/158778)

Issue: [#157709](https://github.com/llvm/llvm-project/issues/157709)

## Closing Thoughts

I learned more than I expected:

* About `constexpr`, sure. But also about Clang internals, how intrinsics flow through the frontend, and the lovely balance between AST and interpreter.
* LLVM has a steep curve, but the community’s been welcoming and helpful. (Special thanks to the reviewers!)
* It felt good to contribute something useful. Even if it's "just" `constexpr` for a few AVX intrinsics, it's a real feature used by real code.


![fabulous cat](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTg3YTY0MGZ0cnVsNDEwemg1bjM1dWV0ZGMyaWt4aWc4NjZja3c0dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BMR4cgypuglVu/giphy.gif)
