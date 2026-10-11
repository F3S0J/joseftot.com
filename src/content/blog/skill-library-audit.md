---
title: "Nineteen of my agent's skills had gone silent"
description: "An audit of what Claude Code really loads at the start of every session: a skill menu with a shared budget that drops descriptions without telling you, a memory index that stops at 200 lines, and a second memory store I did not know I had."
date: 2026-10-11T16:00:00
tags: [agents, tools, context, howto]
---

*I normally write about agents without naming a product. This post is about limits that are
specific to Claude Code, so it names it.*

After a few months of daily use my setup had 42 skills and about 160 memory notes. It worked,
mostly. Sometimes the agent did a job the long way round although a skill existed for exactly
that job. Sometimes it told me something was unknown that it had written down itself three
weeks earlier.

I assumed the usual explanation: too much context, the model gets vague. So I asked for an
audit, expecting a list of things to delete. The audit found something else. **Almost nothing
was too big. Several things were simply not loaded.**

## What is loaded before you type anything

Three things are in the context at the start of every session:

1. **The skill menu**: one entry per skill, name plus description. This is all the model knows
   about a skill until it opens it.
2. **The memory index**: one line per note. The notes themselves are read on demand.
3. **The standing instructions file**, in full.

Everything else (skill bodies, reference files, scripts, the notes) costs nothing until it is
read. So the audit is really about those three, and about whether what you think is in them
is in them.

## Finding 1: the menu had dropped 19 descriptions

The skill menu has one shared budget, by default one percent of the context window. When all
descriptions together are larger, every skill keeps its **name**, and descriptions are dropped,
starting with the skills used least.

My 42 descriptions came to about 10,000 tokens. Nineteen had been dropped.

A skill without a description still exists. You can call it by name. But the model can no
longer tell what it is for, so it never picks it up by itself. From the inside this looks
exactly like "the agent forgot it has a tool for that". Nothing is reported, and the skills
that go quiet first are the ones you use least, which are the ones you would not notice.

Two more skills were silent for a duller reason. One had no header block at all. One had a
header that did not parse, and a header that does not parse loads with empty metadata.

**The fix** was one line in the settings (`skillListingBudgetFraction`, from 0.01 to 0.02)
and two repaired headers. A fresh session confirmed that all 42 descriptions were back.

The obvious fix would have been to shorten every description until they fit. That risks
removing exactly the words that make a skill fire.

## Finding 2: the index cuts off, and the newest notes go first

The memory index loads only its first 200 lines or 25 KB, whichever comes first. New entries
are appended at the bottom. So when the index overflows, **the newest memories are the ones
that disappear**.

Mine was at 158 lines and 19 KB, growing by about 31 notes a week. The audit put the day it
would overflow at nine days out.

The fix here was merging, not deleting. Lines that belong to one stable topic became one line
that still links every note: about 160 lines became 89, with all 160 notes still reachable. Status
text ("waiting for X", "sent on the 5th") moved out of the index lines and into the notes,
where it can go stale without costing anything.

Two things I learned doing it:

- **Bytes are the limit you hit first**, not lines. After the merge the index was at 45 % of
  its lines and 65 % of its size.
- **Never group by who you are waiting for.** It is the obvious grouping and it changes every
  week. Group by topic, which does not.

I also wanted an archive for closed matters. The audit went through the 22 notes that looked
finished. Nineteen still had something open: an unanswered question, an unpaid fee, a choice
nobody had made. An archive would have freed two lines. Things are less finished than they
look.

## Finding 3: there was a second memory

Memory is keyed by the folder a session starts in. For months, some of my sessions had been
started in a different folder than the rest. Those sessions had their own memory: **100
notes**, June to September, that no session started anywhere else could see.

That explained the oddest failures. At one point the agent told me flatly that no feed for my
bank transactions existed. One existed. It had built it. The note was in the other store.

The second store is now marked frozen, and the standing instructions say where it is and to
read its index before declaring anything unknown. A real merge is still open.

## Finding 4: the rules had no home

My working rules ("ask before every outgoing message", "at most three workers at once") were
feedback notes scattered through the memory. A rule in a note is only applied if the note is
opened, and nothing makes the agent open it.

They now live in one instructions file of under 200 lines that loads every time. Each rule
is one or two lines and names the note that holds the reason, so the file stays short and the
why is one read away.

## The honest bill

After all this, the context that loads at the start of every session is **larger** than
before: about 5,400 tokens more. The menu gained 3,100 because 19 descriptions came back,
the instructions file added 2,700, the index gave back 400.

That is the right direction. The research on long contexts (the best summary I know is
Chroma's *Context Rot* study from 2025, across 18 models) does not show a cliff at some
percentage. It shows a slow slope, and it shows that **a related distractor hurts more than
plain filler**. For a skill library that means the risks come in this order:

1. skills that are broken and never fire,
2. two skills the model has to guess between,
3. old sections inside a skill that contradict newer ones,
4. sheer token weight, last and least.

The audit measures the second one too, by comparing every description with every other. My
closest pair scored 0.22 on a scale where 0.35 is where guessing starts. So the library was
not confusing. Parts of it were just switched off.

## How it was done safely

A clean-up of the files your agent depends on is a good way to lose things, so:

- **Backup first**, as a dated archive on another drive.
- **A link ledger.** Before any change, a script recorded every path, URL and note link in
  every skill and note. After each step it ran again. Result: zero lost.
- **Nothing is removed for being unused.** Parked work comes back. A skill I have not
  touched since July is the one I will need in January.
- **Unattended rewriting of memory is switched off.** Nothing reorganises the notes while
  I am not looking.

One repair shows why the ledger was worth it. Three files contained Windows paths in which a
backslash and the letter after it had turned into a control character somewhere along the
way: a tab where `\t` used to start a folder name, a bell character where `\a` did. The paths
looked fine at a glance and pointed nowhere. Everything is written with forward slashes now.

## Check your own

- Count your skills, then check how many **show a description** in the menu. A dropped
  description is the cheapest serious bug you can have.
- Look at the line count and the size of your memory index, and at how fast it grows.
- Find out which folder your sessions start in. If the answer is "it depends", you have more
  than one memory.
- Put the key use and the trigger words **first** in every description. Entries are also cut
  individually at about 1,500 characters. Two of mine end mid-sentence.
- Put rules where they load, with a pointer to the reason.

Still open on my side: trimming the longest descriptions without losing a trigger word, so
the budget can go back down; and folding the "status of skill X" notes into the skills
themselves, where the next session will actually see them.
