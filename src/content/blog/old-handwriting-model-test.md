---
title: "Eight models read a letter from 1726"
description: "One page of an 18th-century Spanish secretary hand, the same prompt to eight vision models. The error rate matters less than how each one fails: some slip on a letter, some swap in a plausible wrong word, and two write fluent fiction."
date: 2026-10-11T14:00:00
tags: [llm, archives, research]
---

The Archivo General de Indias in Seville holds the paperwork of the Spanish empire overseas:
around 80 million pages, of which only a small part is scanned. The scans that exist are free
to read through PARES, the portal of the Spanish state archives, without a login.

Free to read is not the same as readable. The pages are handwriting, three hundred years old,
full of abbreviations. So the first question, before any research can lean on them, is a plain
one: **which model can actually read this?**

## The test

One page: the first page of a letter from the governor of the Philippines, written in Manila
on 26 August 1726 (signature FILIPINAS,141,N.15). It is a clear secretary hand in two columns,
with a faded second hand in the margin. The scan is about 1,000 by 1,500 pixels and carries a
watermark.

The page reports a shipwreck. The galleon *Santo Cristo de Burgos* left Cavite on 8 July 1726
and ran aground at the Ticao anchorage on 23 July, in two and a half *brazas* of water, a
little over four metres. The merchants of Manila gave two percent of their funds held in
Mexico toward a replacement ship.

Every model got the same image and the same prompt: one manuscript line per line, abbreviations
expanded in square brackets, unreadable words marked. The score is the character error rate
after flattening everything that is spelling noise in a text of that age: case, accents,
spacing, u/v, i/y, c/z and the abbreviations.

<figure>
<svg class="diagram" viewBox="0 0 720 240" role="img" aria-label="Bar chart of character error rate per model: Opus 5.5 0.3 percent, gemini-pro-latest 0.6, gemini-3.8-flash 0.9, gpt-6.1-sol 1.7, Sonnet 5.5 2.3, Haiku 5.5 5.9, gemini-2.5-flash-lite 23.5, gpt-4o 38.6">
<text x="10" y="24">Opus 5.5</text><rect class="hl" x="190" y="13" width="4" height="14"/><text class="d" x="202" y="24">0.3 %</text>
<text x="10" y="52">gemini-pro-latest</text><rect class="hl" x="190" y="41" width="7" height="14"/><text class="d" x="205" y="52">0.6 %</text>
<text x="10" y="80">gemini-3.8-flash</text><rect class="hl" x="190" y="69" width="11" height="14"/><text class="d" x="209" y="80">0.9 %</text>
<text x="10" y="108">gpt-6.1-sol</text><rect class="hl" x="190" y="97" width="21" height="14"/><text class="d" x="219" y="108">1.7 %</text>
<text x="10" y="136">Sonnet 5.5</text><rect class="hl" x="190" y="125" width="29" height="14"/><text class="d" x="227" y="136">2.3 %</text>
<text x="10" y="164">Haiku 5.5</text><rect class="hl" x="190" y="153" width="73" height="14"/><text class="d" x="271" y="164">5.9 %</text>
<text x="10" y="192">gemini-2.5-flash-lite</text><rect class="hl" x="190" y="181" width="291" height="14"/><text class="d" x="489" y="192">23.5 %</text>
<text x="10" y="220">gpt-4o</text><rect class="hl" x="190" y="209" width="479" height="14"/><text class="d" x="677" y="220">38.6 %</text>
</svg>
<figcaption>Character error rate on one page. Lower is better. Read the caveats before quoting this.</figcaption>
</figure>

## The caveats come first

- **It is one page.** An easy one: a trained 18th-century clerk writing for the king.
- **The referee is not neutral.** I cannot read this hand well enough to be the reference. The
  reference is the strongest model's reading, re-checked word by word against crops enlarged to
  double size. That flatters its own score. The order of the top three should not be trusted.
- **The second-best models corrected the reference twice.** Both Gemini models read two words
  right that the reference had wrong. So even the "truth" in this test had errors that only a
  second reader found.

With that said, the gap between the top five and the bottom two is not a matter of caveats.

## How they fail matters more than how often

A percentage hides the thing you need to know. A transcription with 2 % errors is excellent if
the errors are single letters, and dangerous if they are whole words that still make sense.

| reader | typical failure |
|---|---|
| Opus 5.5 | letter-level slips; tends to normalise spelling toward the expected word |
| gemini-pro-latest, gemini-3.8-flash | letter-level slips only |
| gpt-6.1-sol | swaps in a plausible wrong word, without a mark |
| Sonnet 5.5 | changed "el Galeon Capitana" into "el Patache Capitana" |
| Haiku 5.5 | invents words that are not on the page |
| gemini-2.5-flash-lite | collapses into bracketed fragments |
| gpt-4o | fluent, confident, invented text |

The middle of that table is the trap. One model read "venida" where the page says "perdida":
*arrival* instead of *loss*, in a letter about a shipwreck. It read "un Navio" for "en Mexico".
Both sentences still parse. And its question marks, the places where it said it was unsure,
sat on words it had read correctly.

**A model's own doubt marks are no guide.** That was the most useful single finding.

The bottom of the table is easier to deal with, because it is obvious. A 38 % error rate is
not a bad transcription. It is a different text, written in good period Spanish, about
roughly the same subject.

## Two readers, and a crop for every fact

The second page of the same letter went through the procedure I now use: two of the good
models read it independently, and a small script lists only the places where they saw
different words.

On about 500 words they differed in **13 places**. Two of those touched a fact, so they were
settled on an enlarged crop of the scan. Both times the second reader was wrong: it had read
"Real hazienda" for the abbreviation of *Audiencia*, and "2 de enero" for "9 de enero". It
also turned "un dos por ciento" (two percent) into "unos por ciento".

So the rule is narrower than "use two models and take the majority":

1. First reading by the strongest model.
2. Second reading by a different good model.
3. Diff. The differences are a list of **doubtful places**, not a vote.
4. Every place that touches a fact (a name, a number, a date, a place, a direction, a depth)
   is settled by a person or a model looking at an enlarged crop.
5. Each fact goes into the notes with how it was read: settled on the crop, agreed by two
   models, or one model only.

Numbers, dates and compass directions are where a wrong reading costs most. A date that is
off by a week moves a ship a few hundred miles.

## What it costs

One page on the fast model took 84 seconds: 1,251 tokens in, 933 tokens out, and 12,093
tokens of thinking. The transcription is short. The reading is where the work goes. For a
66-page letter that is still small money, but it is worth saying the page count out loud before
starting a run on a whole bundle.

## What is not tested

- **Older hands.** Sixteenth-century notarial writing is a different problem from a 1726
  clerk. Expect every model to be clearly worse.
- **German Kurrent.** One row of an Austrian parish register so far: the date, the hour, the
  house number, the age and the burial day came out right; the title words and the surname came
  out wrong. Good enough as a pointer to numbers, not for names.
- **Local models**, and anything medieval.

## A note on the archive

PARES answers plain HTTP requests once you hold a session cookie, so a script can search the
catalogue and fetch page scans one at a time. Two things to know. The search covers the
catalogue descriptions, not the handwriting: the portal's handwriting search exists only for
a few series, and none of them are in the Archivo de Indias. And the catalogue is uneven: a
search for *naufragio* (shipwreck) returned 601 records, 261 of them scanned.

That is the real state of things. The documents are open, a good model reads an easy hand
almost as well as a trained person, and the part that still needs care is knowing which words
to doubt.
