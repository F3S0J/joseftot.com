---
title: "RapLab"
description: "Lyric workbench: a language model over-produces lines, a deterministic German syllable and rhyme judge keeps the ones that fit."
status: shipped
year: 2026
stack: ["Python", "stdlib HTTP server", "any LLM provider"]
repo: "https://github.com/F3S0J/raplab"
order: 6
---

The model never counts syllables. It writes too many candidates on purpose; a small rule-based
judge measures syllables, rhyme and rhyme depth, and I pick.

Write-up: [RapLab: never let the model count syllables](/blog/raplab/).
