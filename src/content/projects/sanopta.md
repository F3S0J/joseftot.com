---
title: "Sanopta"
description: "Compliance and commercialisation engine for low-risk medical devices: regulatory data is locked behind a compliance gate, and every image, text and listing is generated from it."
status: archived
year: 2026
stack: ["React + TypeScript", "Supabase / Postgres", "containerised agent worker", "job queue"]
order: 12
---

Regulated products have a rule that most marketing ignores: the intended purpose and the safety
claims are legally fixed, and nothing you publish may drift from them.

Sanopta turns that into architecture. Device identifiers, declarations of conformity and approved
claims sit behind a **compliance gate** as the single source of truth. Commercial output (images,
copy, A+ content, marketplace listings) is generated only from that locked data.

The web app never calls an agent directly. It writes a job to a queue in the database; a
containerised worker runs the matching agent (instructions-for-use builder, declaration generator,
listing agents) and writes the result back. One worker image, many agents, secrets sealed on the
worker.

## Frozen in September 2026

The idea survived. The app did not. A device in Sanopta and the same product in an ERP are two
masters, and keeping two masters in step was the problem this project was meant to remove. So
the data model, the lock and the claims rules were rebuilt as modules inside an ERP, with
Sanopta as the blueprint: [ERP as the single source of truth](/projects/erp-rollout/).

Not ported: the document and catalogue generators. The ERP holds the approved data, an agent
typesets the document from it, a person releases it. What the port taught me about my own
design is in [One lead, many workers](/blog/erp-port-lead-and-workers/).
