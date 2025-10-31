+++
title = "My First LLVM Patch: AVX/AVX512 Subvector Insert Intrinsics in `constexpr`"
date = 2025-09-22
description = "Documenting the work behind LLVM PR #158778"

[taxonomies]
tags = ["LLVM", "clang", "constexpr"]

[extra]
image = "images/LLVM.png"
image_credit = "https://llvm.org/"
+++

In LLVM PR [#158778](https://github.com/llvm/llvm-project/pull/158778) I enabled `constexpr` support for AVX and AVX512 subvector insert intrinsics, allowing code that uses helpers such as `_mm256_insertf128_ps` to fold at compile time. The change removes a long-standing gap between the runtime behavior of these intrinsics and the guarantees developers expect inside `constexpr` functions.

## Summary

* Extended both of Clang’s constant-evaluation engines (`ExprConstant.cpp` and `InterpBuiltin.cpp`) so they understand the x86 insert builtins.
* Added validation around vector sizes, subvector widths, and insertion offsets to match hardware semantics.
* Landed over 40 new `TEST_CONSTEXPR` cases in the `clang/test/CodeGen/X86` suite to lock in support across AVX and AVX512 variants.

## Implementation Notes

Constant evaluation in Clang runs through two independent paths: AST evaluation during semantic analysis and the bytecode interpreter used by the experimental constexpr VM. Each path needed the same primitive:

1. Fetch the base vector and the subvector operands.
2. Verify element counts and derive the target lane from the immediate operand.
3. Copy the subvector elements into the base vector while preserving `APValue` metadata.

The AST path lives in `ExprConstant.cpp` and manipulates `APValue` directly, while the interpreter path adds bytecode handlers in `InterpBuiltin.cpp`. Keeping the logic in sync required building small helpers shared across both implementations.

## Builtins and Headers

The Clang frontend maps intrinsics through `BuiltinsX86.td` into header wrappers in `clang/include/clang/Headers`. Once the constant evaluator gained support for the builtins listed there, existing user code (and the standard Intel headers) immediately benefited without further changes. This also meant no additional masking logic was necessary: the headers expand mask variations into separate builtins, so the evaluator only needs to honor the immediate lane argument.

## Testing

Reviewers asked for the new behavior to be exercised in the same files that cover the rest of the x86 builtin matrix. I replaced an ad-hoc test with additions to `clang/test/CodeGen/X86/avx{,2}-builtins.cpp` and related files, all using `TEST_CONSTEXPR` to guarantee compile-time execution. A representative case:

```c
TEST_CONSTEXPR(match_v16si(
  _mm512_mask_inserti32x4(base, 0x00F0, base, sub, 1),
  2, 3, 4, 5, 20, 30, 40, 50, 10, 11, 12, 13, 14, 15, 16, 17));
```

These tests cover lane boundaries, mask interactions, and error paths to ensure both evaluators agree on the result.

## Result

After two review rounds focused on naming consistency and LLVM formatting rules, the change was approved and merged. Issue [#157709](https://github.com/llvm/llvm-project/issues/157709) is now closed, and constexpr users can rely on these intrinsics in table-generation and other compile-time SIMD workflows.
