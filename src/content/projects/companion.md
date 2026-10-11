---
title: "Companion"
description: "A phone app that listens to a conversation and whispers short cues into one earbud."
status: experiment
year: 2026
stack: ["Android", "speech-to-text", "small language model"]
order: 7
---

The phone listens, a small, fast language model decides whether there is anything worth saying,
and if so it whispers a three-to-six word cue into a single earbud.

Version 0.1 runs on my own phone, with a second, slower lane that researches in the
background and puts a card on the screen. A real conversation test with earbuds is still
open. The interesting problems are latency and knowing when to stay quiet.

A second direction came out of a feasibility test in October: the same listening, for office
work. Someone repeats a phone order aloud, and the order is pre-filled for approval. The test
said it is worth building, but as push-to-talk dictation with speech recognition on an office
PC, not as an always-on listener. Pulling the order out of the text worked well. Getting
product and customer names right in the speech-to-text step is the weak link.
