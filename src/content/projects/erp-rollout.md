---
title: "ERP as the single source of truth"
description: "Two small companies, one open-source ERP: regulatory device data, documents, orders and books in one database, built as custom modules by a lead agent, workers and reviewers. Agents prepare, a named person approves."
status: active
year: 2026
stack: ["Odoo 19 Community", "Python", "PostgreSQL", "Docker", "Typst", "Playwright"]
order: 2.5
---

A medical-device manufacturer and a trading company share one ERP database. The device data
that used to live in my own app, [Sanopta](/projects/sanopta/), is now an extension of the
ERP's ordinary product, so a listing, a label, an order and an invoice all read the same
record.

The build runs as a team: a lead agent holds the spec and the merges, workers build one
package each on their own branch and scratch database, fresh reviewers check every package,
and browser tests walk the real screens in eight lanes. Approval belongs to a named person.
The agents' account is excluded from it by construction.

**Status, honestly:** more than two dozen custom modules, clean on a test system. No real
order or booking has gone through it yet. The first end-to-end test by a person is under way.

Write-up, with what the port found in my own design:
[One lead, many workers](/blog/erp-port-lead-and-workers/).
