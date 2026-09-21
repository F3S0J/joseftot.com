---
title: "An agent that argues both sides: legal research with RIS"
description: "How a landlord who wanted to keep our deposit taught me the method, and how it became a system of agents that fetch Austrian law and case law, argue for and against, and refuse to cite anything they have not read."
date: 2026-09-21T17:00:00
tags: [agents, law, research]
---

A while ago our landlord decided to keep our rental deposit. The tone was confident, the way it
is when someone assumes the other side won't look anything up.

We looked it up. This was before I had built any tooling for it: just an AI model, the
Austrian legal information system, and a lot of patience. The method was simple. Find the
actual norms, read what the highest court has said about them, write down the other side's
best argument, and answer it. It helped. More importantly, it showed me that the method is
mechanical enough to build.

*This post is about the method and the technology. It is not legal advice, and it says nothing
about any open matter.*

## Why the method works

For a deposit dispute in Austria, the core of the law fits on a page:

- **§ 16b MRG**: the landlord has to keep the deposit in an interest-bearing form and return
  it, with interest, promptly after the tenancy ends, deducting only claims that are actually
  justified.
- **§ 1109 ABGB**: the tenant returns the flat in the condition it was received, and ordinary
  wear from normal use is not damage.
- **§ 1111 ABGB**: a landlord's claims for damage have to be brought to court within **one
  year** after the flat is handed back, or they lapse.

On top of that sits a large body of Supreme Court (OGH) case law on what counts as normal wear
and which standard clauses in rental contracts hold up. None of this is secret. All of it is
free in **RIS**, the federal legal information system. The asymmetry between landlord and tenant
is rarely the law. It is who bothers to read it.

## From a chat to a system

Doing that by hand in a chat window has three weaknesses:

1. **The model cites from memory.** Section numbers and case references that look right and
   aren't. In law, a wrong citation is worse than none.
2. **It agrees with you.** Ask "do I have a case?" and you get encouragement.
3. **It forgets the edges.** Procedure, deadlines, costs, the regional law, the EU layer: a
   conversation drifts to whatever is interesting and misses what is decisive.

So the system is built against exactly those three.

<figure>
<svg class="diagram" viewBox="0 0 760 240" role="img" aria-label="Pipeline: documents and facts, issue tree, then per issue an advocate, adversary, rebuttal, reply and adjudicator, all drawing from fetched sources, ending in a report">
<rect class="box" x="10" y="14" width="150" height="56"/><text x="85" y="38" text-anchor="middle">documents</text><text class="d" x="85" y="58" text-anchor="middle">facts, deadlines</text>
<rect class="box" x="185" y="14" width="150" height="56"/><text x="260" y="38" text-anchor="middle">issue tree</text><text class="d" x="260" y="58" text-anchor="middle">whole perimeter</text>
<path class="ln" d="M160 42h25M335 42h25"/>
<rect class="box" x="360" y="4" width="390" height="76"/>
<text x="372" y="26">per contested issue, fresh context each:</text>
<text x="372" y="48">advocate → adversary → rebuttal</text>
<text x="372" y="68">→ reply → adjudicator</text>
<rect class="box" x="120" y="150" width="440" height="60"/>
<text x="340" y="174" text-anchor="middle">sources, fetched live and stored</text>
<text class="d" x="340" y="196" text-anchor="middle">RIS · EUR-Lex · HUDOC · parliament</text>
<path class="ac" d="M470 80v70"/>
<text class="d" x="480" y="120">no fetch, no citation</text>
<rect class="box" x="600" y="150" width="150" height="60"/><text x="675" y="174" text-anchor="middle">report</text><text class="d" x="675" y="196" text-anchor="middle">routes, costs</text>
<path class="ln" d="M675 80v70"/>
</svg>
<figcaption>One case per folder. Facts first, then the whole perimeter, then a debate on the few issues that matter.</figcaption>
</figure>

### 1. No citation without a fetched source

Every norm and every ruling an argument relies on has to be **fetched from the primary source
and stored** before the argument can be saved. The database refuses an argument whose anchors
were never downloaded, and a citation check runs before any report is written. The model can
still be wrong about what a ruling *means*, but it can no longer invent one.

The sources are all public, and most have proper APIs:

- **RIS open data** (federal law, all nine *Länder*, municipal ordinances, and the case law of
  the OGH, VwGH, VfGH and the regional administrative courts), including the *Rechtssätze*,
  the court's own condensed legal principles. Laws can be fetched in the version that applied
  on a given date, which matters when the facts are old.
- **EUR-Lex** through its SPARQL endpoint, for directives and CJEU judgments.
- **HUDOC**, for European Court of Human Rights judgments.
- **Parliament**, for the explanatory notes that say what a law was meant to do.

A practical lesson: full-text searches in one court's database often return nothing while the
administrative courts have plenty. Choosing the right court is half the search.

### 2. Argue both sides, in separate heads

Each important issue gets a small debate: an **advocate** builds the best case, an
**adversary** attacks it (and has to be as strong as the advocate), then a **rebuttal**, a
**reply**, and finally an **adjudicator** who weighs them. Each role runs in a fresh context,
so the adversary cannot be charmed by the advocate's prose.

Arguments are scored on four axes (norm, precedent, facts, procedure), and **the weakest axis
counts double**. A brilliant argument from principle with no supporting facts is a weak
argument.

### 3. Walk the whole perimeter before judging

Before anything is argued, a planner walks a fixed list of layers: procedure and deadlines,
substantive law, regional law, municipal ordinances, whether an ordinance itself is lawful,
fundamental rights, EU law, state liability, costs. Most layers get a short note; only the
two to four issues that decide the outcome get the full debate.

And there are anti-bias rules written into the roles. The size or wealth of the other side is
never a weight. The word "hopeless" is banned until the perimeter has been walked.

## What it costs

Debating one contested issue in depth costs a few euros in model usage, mostly because each
role re-reads its sources many times. That shaped the design: a cheap pass over everything,
an expensive debate only where it pays.

## What this means for everyone else

Legal information in Austria is unusually open. The barrier was never access. It was the hours
it takes to find the three norms and the five rulings that matter, and the discipline to read
the other side's argument honestly. Agents are good at exactly that kind of patient, sourced,
two-sided reading, as long as you build them so they cannot skip the reading.

You still need a lawyer to represent you. But you can walk into that meeting knowing the norms,
the case law and the weak spot of your own position, and that changes the conversation.
