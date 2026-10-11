---
title: "One lead, many workers: moving a compliance system into an ERP"
description: "I froze my own regulatory app and rebuilt it as modules inside an open-source ERP, with a lead agent, workers and reviewers. How two million tokens of source became a spec, what the old design could not tell apart, and the bug every review found: the agent could lift its own gates."
date: 2026-10-11T18:00:00
tags: [agents, erp, compliance, automation]
---

In the post about the [agent team that ships listings](/blog/agent-team-amazon/) I
described [Sanopta](/projects/sanopta/): an app of my own that keeps the regulatory data of
medical devices behind a compliance gate and generates everything else from it. In September
I froze it. This is why, and what three weeks of rebuilding it inside an ERP with a team of
agents looked like.

Status first, because this is not a victory post: **nothing here runs a real business yet.**
It runs on a test system, and the first full human test of one product has only just
started.

## Why I froze my own app

The work is for two small companies: a manufacturer of medical devices and a trading company
that sells some of its products online. Sanopta held the regulatory truth for the devices.
But orders, stock, invoices and prices have to live somewhere too, and that somewhere is an
ERP.

A device in my app and the same product in an ERP are **two masters**. Two masters need a
sync, and a sync is where a wrong article number or an outdated claim gets in. I had built
the thing the project exists to remove.

So the decision was one database for everything binding: an open-source ERP (Odoo, the free
Community edition, self-hosted in containers), two companies in it, and my own modules for
the regulatory layer. If two systems ever disagree, the ERP is right. Files live in a
document drive. Bulk machine data (raw reviews, keyword statistics, render history) stays in
a separate analytics database, because nobody needs to approve it.

The device itself became an extension of the ERP's ordinary product, not a parallel "device"
record next to it. A second product tree inside the same system would have been the same
mistake one level down.

## The spec is the compression boundary

The old app had 62 tables and a repository of about two million tokens. No agent can hold
that, and no agent should have to.

So before any module was written, four workers each got a named slice of the old source
(schema, identifiers, registration export, lock and claims) and wrote a digest. They ran in
parallel and were done in about 14 minutes. A lead agent assembled the digests into three
documents: the data model, the logic to port with every deliberate difference marked, and the
contracts between modules.

The rule that came out of it: **after the spec, nobody reads the old code again.** Everything
the new system needs to know about the old one has to be in those three documents, or it is
not ported.

Two things I would repeat:

- **Workers check the lead.** The lead agent had three facts wrong in its briefs: the number
  of tables (it had counted a list that included seven functions), the number of device
  flags, and the standard behind a check-character algorithm. The workers, reading the
  actual source, corrected all three. A brief that names its sources invites that.
- **Algorithms come with test vectors.** The identifier check digits were re-implemented and
  had to reproduce the examples the standards body publishes, before a line of module code
  existed. 151 test vectors were inventoried in the spec.

Then a human gate: I read the spec and made four decisions. Only then did building start.

## What the old design could not tell apart

Porting is the best code review a system ever gets. The port found things in my own app that
no user had reported.

The most instructive one is a single data type. Risk classification asks a list of yes/no
questions about a device. The old schema stored them as booleans that default to *false*.
So "no" and "nobody has answered this yet" were the same value. An empty product classified
as the lowest risk class, and could be locked as approved.

The new rules:

- **Three states**: yes, no, not answered.
- **The classification refuses to run on an incomplete set.** It returns "incomplete", not a
  class.
- **Old answers are not migrated.** A stored *false* cannot be told from a real no, so every
  imported product starts as "not answered" and needs one human pass. No old lock is taken
  over as valid.
- **Editing a verified value clears its verification.** In the old design a value could be
  checked, changed, and still count as checked.
- **Locked means read-only, with a versioned snapshot.** Unlocking needs a recorded reason
  and creates a new version.

## Elevated agents need walls in the database

Agents in this system run with elevated rights. They have to: they create products, file
documents, prepare orders. That changes what a permission is worth.

The old app protected its immutable tables with row-level security plus a database trigger,
because the service account bypassed the row-level rules. The ERP has the same hole under a
different name: code running in superuser mode bypasses access rules. So immutability is
enforced twice, in the application layer and by a trigger in the database itself. **An access
rule alone protects nothing from the party that is allowed to ignore access rules.**

Approval works the same way. It belongs to a named group, and the agents' account is excluded
from that group by construction. Agents prepare, a named person approves, signs and carries
the responsibility. That makes me the bottleneck on every lock and every claim. That is the
design, not a defect in it.

One honest footnote: on the development machine the agents' account is still an
administrator, so today this holds on the normal paths and by rule. Before real data goes in,
it becomes a restricted user with a separate human administrator.

## The bug every review found

Each work package gets a fresh reviewer agent that has not seen the worker's reasoning. Over
three weeks the reviews found many small things and one thing again and again:
**the agent could lift its own gates.**

Not by anything dramatic. ERPs let a caller pass default values when creating a record. A
record could be created as already confirmed. A value could arrive already marked as
verified, with no verification behind it. A plain write could set a field that a button was
supposed to guard. An audit of that one pattern found 15 exploitable cases across the
modules. Later, three independent reviews of three new modules found the same class again.

Two fixes mattered:

- **One guard, one question.** There is now a single small module that answers "is this the
  agent?", and every gate asks it. Before that, each module had its own idea of how to tell.
- **No convenient exemptions.** The agents' account had been allowed to create bank statement
  lines, to make an import easier. A review showed how that could be abused. The exemption is
  gone: the agent creates no bank lines and posts nothing. Bank import became its own design,
  with batches a person approves.

I also stopped something. Two packages had gone through five or six adversarial review rounds
each in one evening, in the style of a penetration test. For an internal tool that is
reachable only on a private network, that was overboard. The rule now is one normal review
per package: does it do what the brief says, do the approval rules hold, are the locks and
migrations right. Leftover hardening goes on a backlog, to be reopened if the system is ever
exposed to outside users.

## Do not port the generators

The old app had screens that generated documents: a catalogue maker, a declaration builder
that at one point had an image model render the whole document as a picture. None of that was
ported.

The pattern instead: the ERP holds the approved data. An agent with the right skill typesets
the document from it (a real PDF with a text layer, from a template), registers it as a
draft, and a person releases it. Data models and guards are worth porting. Template engines
and builder screens are not, because an agent with a good brief does that job better than a
form ever did.

## How the team runs

- **Three roles.** A lead holds the plan, the spec and the merges. Workers build one package
  each from a written brief, on their own branch and their own scratch database. Reviewers
  start fresh.
- **Three workers at once, no more.** Partly for usage limits, partly for memory. At one
  point the database server crashed with about 90 scratch databases open and the container's
  default shared memory. The fix was more shared memory and a clean-up, and a habit of
  dropping scratch databases when a package is merged.
- **One system for answers.** Everything merged goes into one playground database, and
  "does it work end to end?" is only ever answered there. This rule exists because of one
  day when three packages were merged and tested in three separate databases, and no single
  system held all of them.
- **Agents do the clicking.** Browser tests in eight lanes walk the real screens: the
  compliance path, order to cash with its PDFs, mail and marketing, the tax form, a sweep
  through every menu. Nothing that can be clicked by a script lands on a person's list.
- **The test count is a side effect**: 186 for the first module, 500 with the lock, 1,000
  after the hardening round, 2,600 by early October.

## Where it stands

More than two dozen custom modules: devices and classification, evidence, the lock,
approvals, documents, the registration export, supplier documents, sales and order intake,
pricing, purchasing, a tax form for the monthly return. The playground is clean in all eight
test lanes.

What that does **not** mean:

- No real order, invoice or booking has gone through it.
- The first end-to-end test by a person, one product in 25 steps with a phone as the scanner,
  is under way as I write. I expect a list.
- The cut-over of the books and the migration of the legacy data are not done.
- The acceptance test for the bookkeeping is strict: a month that was already filed has to
  come out of the new system line by line as it was filed, before anything runs in parallel.

## If you do something like this

- **If your own app would be a second master, freeze it** and make it the blueprint.
- **Spend the first days on a spec, and treat it as a wall.** Workers read slices, the lead
  reads digests, nobody reads everything.
- **"Not answered" is a value.** Never let a default stand in for a human decision.
- **Enforce the important rules below the layer your agents can bypass.**
- **Look for the gates your agent can open by itself.** There will be some.
- **Port the data and the guards, not the screens.**
