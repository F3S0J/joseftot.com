---
title: "Context audit"
description: "An audit for an agent's skill library and memory: what loads at the start of every session, what is silently dropped, and a link ledger that proves a clean-up lost nothing."
status: shipped
year: 2026
stack: ["Python", "Claude Code skills"]
order: 7.5
---

It measures what each skill costs to discover and to open, finds descriptions that are
missing, cut off or too alike to tell apart, and checks the memory index against its limits
and its growth rate. Before any change it records every path, URL and link in the library, and
it runs the same check afterwards.

On my own setup it found 19 of 42 skills without a visible description, two broken headers,
an index nine days from overflowing and a second memory store nobody knew about.

Write-up: [Nineteen of my agent's skills had gone silent](/blog/skill-library-audit/).
