---
title: "RapLab"
description: "A lyric-writing workbench: a language model over-produces lines, a deterministic judge counts syllables and rhymes and keeps the ones that fit."
status: experiment
year: 2026
stack: ["Python", "LLM", "local web app"]
order: 3
---

Language models are bad at counting syllables and worse at judging their own rhymes.
RapLab does not ask them to. The model writes far too many candidate lines, and a
plain, deterministic checker measures syllables and rhyme and throws most of them away.
