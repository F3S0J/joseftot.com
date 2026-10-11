---
title: "A phone number for the agents"
description: "A phone line that calls me with a status, answers when I call, and takes a message from everyone else. The pipeline on one gaming graphics card, the latency budget, two telephony traps, and the rule that a stranger never reaches the model."
date: 2026-10-11T17:00:00
tags: [agents, voice, telephony]
---

Most of what my agents need from me is small: an OK, a missing fact, a choice between two
options. A chat window is fine for that at the desk. In the car it is useless.

A phone call is the oldest interface there is, and it works with gloves on. So the agents got
a phone number. This is what it does today, in the order it was built, and what broke on the
way.

## Level 0: the machine calls you

The first version is one command and no server:

```bash
call.py status "The backup finished. Two files were skipped." --to me
```

The telephony provider accepts the whole call as a few lines of markup: say this text with
this voice, hang up. Nothing has to be reachable from the internet. That is the whole first
version. A long job that ends with a phone call is a job you can walk away from.

## Level 1: a voice you can talk to

The second version answers. I did not want to rent a voice-agent platform by the minute, so
the whole chain runs on the workstation that is on anyway:

<figure>
<svg class="diagram" viewBox="0 0 760 210" role="img" aria-label="Pipeline of a call: phone network to provider, audio stream through a tunnel to the workstation, where voice activity detection, speech-to-text, a small language model with the notes, and text-to-speech run in sequence; the answer goes back the same way">
<rect class="box" x="10" y="20" width="120" height="56"/><text x="70" y="44" text-anchor="middle">caller</text><text class="d" x="70" y="64" text-anchor="middle">phone network</text>
<rect class="box" x="170" y="20" width="130" height="56"/><text x="235" y="44" text-anchor="middle">provider</text><text class="d" x="235" y="64" text-anchor="middle">audio stream</text>
<path class="ln" d="M130 48h40"/>
<path class="ac" d="M300 48h60"/>
<text class="d" x="330" y="38" text-anchor="middle">tunnel</text>
<rect class="box" x="360" y="6" width="390" height="190"/>
<text x="372" y="28">workstation</text>
<rect class="box" x="376" y="42" width="170" height="56"/><text x="461" y="64" text-anchor="middle">speech detector</text><text class="d" x="461" y="84" text-anchor="middle">when did they stop?</text>
<rect class="box" x="564" y="42" width="170" height="56"/><text x="649" y="64" text-anchor="middle">speech-to-text</text><text class="d" x="649" y="84" text-anchor="middle">on the GPU, 0.45 s</text>
<rect class="box" x="564" y="124" width="170" height="56"/><text x="649" y="146" text-anchor="middle">small language model</text><text class="d" x="649" y="166" text-anchor="middle">notes in the prompt</text>
<rect class="box" x="376" y="124" width="170" height="56"/><text x="461" y="146" text-anchor="middle">text-to-speech</text><text class="d" x="461" y="166" text-anchor="middle">local voice</text>
<path class="ln" d="M546 70h18M649 98v26M564 152h-18"/>
</svg>
<figcaption>One call, four stages. Only the language model is a remote service; the listening and the speaking happen on the machine under the desk.</figcaption>
</figure>

- The provider (Twilio) streams the call audio over a WebSocket. A tunnel (Tailscale Funnel)
  makes exactly one local port reachable for it.
- A voice activity detector (Silero) decides when the caller has stopped speaking.
- Whisper (the large-v3-turbo model, through faster-whisper) turns the sentence into text
  in about **0.45 seconds** on an older gaming graphics card.
- A small, fast language model answers. Its system prompt is the agents' own notes, so it
  knows what is going on in every project without a lookup.
- Piper speaks the answer with a local voice.

You can interrupt it mid-sentence. It has two tools at first: write a note for the agents at
the desk, and hang up.

## The latency budget

A phone call has no patience. More than two seconds of silence and people say "hello?".

The first simulated calls took 1.6 to 2.7 seconds from the end of my sentence to the first
sound, and with a cold start the first answer took ten. Getting that down was a list of small
things, none of them clever:

- **Warm the prompt cache when the call starts.** The long system prompt is cached by the
  model provider, but only after the first request. A cold cache was the ten seconds. One
  warm-up request at the start of the call fixed it.
- **Start speaking at the first comma.** Do not wait for the whole answer. The first clause
  goes to the voice as soon as it exists.
- **Wait 450 ms after speech ends** before deciding the caller is done.
- **A filler after 1.5 seconds**, and a fixed "one moment, I'll look" before anything that
  needs a lookup. A person does the same.

That put the first words at about 1.6 to 1.8 seconds. I also measured the lazy idea of
giving the model only the index of the notes instead of all of them: first token after 0.65
instead of 0.9 seconds. A quarter of a second was not worth an assistant that has to go and
look things up, so the full notes stayed.

## What the first real calls taught

My own feedback after the first evening was not about speed. It was: some words are hard to
understand, noise interrupts it, and it talks too much.

- **A hard cap of 30 words per answer.** On the phone, a paragraph is a monologue.
- **Barge-in needs confidence.** It now stops talking only after about 0.8 seconds of clear
  speech. Before that, any background noise was an interruption.
- **Transcribe before you react.** If the "sentence" turns out to contain no words, it was
  noise, and nothing happens.
- **Clear beats natural.** I compared voices on real calls and picked a slightly robotic one,
  slowed down by ten percent, over a more natural one, because it was easier to follow. It
  is still not perfect. Out of curiosity I also tried two old-school formant synthesisers.
  They sound wonderful and are too hard to understand on a phone.
- **A pronunciation list.** A German voice reads "Laptop", "Flyer" and "Container" as German
  words. A short list of respellings helps, though not for every word.
- **The persona goes last in the prompt.** With the persona rules above the notes, the model
  copied the style of the notes: English, with markdown, read aloud. Rules after the notes,
  and it spoke German in short sentences.

## Two telephony traps

Both cost an hour and neither gives a useful error.

- **A WAV file that plays as static.** The provider fetches audio by URL and trusts the
  `Content-Type`. My web framework served `.wav` as `audio/vnd.wave`. It has to be
  `audio/wav`.
- **A language tag that is rejected.** The text-to-speech verb takes a voice and a language.
  The Austrian voice exists, the tag `de-AT` does not. It wants `de-DE` with that voice.

A third, smaller one: prepared audio is now written as trimmed 8 kHz mu-law, which is what a
phone line carries anyway. The files are a quarter of the size.

## The rule: a stranger never reaches the model

This assistant knows my projects, and later it got read-only tools for mail and chat. That
makes the question of *who is calling* the whole design.

- **One allowed number, plus a four-digit PIN**, three tries. Caller ID alone can be faked.
- **Everyone else gets a keypad menu and a voicemail.** The message is recorded, transcribed
  locally and written to the same notes file. No model is in that path at all. There is
  nothing to talk into saying something it should not. This path has passed simulated,
  correctly signed requests; a real call from a stranger's phone is still on the test list.
- **Outgoing calls to other people are play-only**: say the text once, hang up. The status
  call I get myself offers "press 2 to talk to the assistant". Sent to anyone else, that
  would hand my notes to whoever picked up, so those calls use a mode with no keypad.
- **Whatever a lookup returns is data, not instructions.** Mail and chat content is wrapped
  and labelled as foreign text before the model sees it.
- **Every webhook is checked for the provider's signature**, and the audio socket only
  accepts a one-time token.

The model still makes ordinary mistakes inside those walls. It once told me a message was
from a business partner when I had written it myself. That is an error I can live with on a
status call. It is the reason nothing gets *sent* by voice.

## The same number on WhatsApp

A business number can also be a WhatsApp sender through the official API, so the line got a
second channel. The rules there are stricter still:

- **No auto-reply, to anyone.** Inbound messages are stored and shown. That is all.
- **Agents write drafts, I send.** A draft sits in the thread on a small inbox page until I
  edit, send or discard it. Sending from the page is the approval.
- **The 24-hour window is enforced in code.** Outside it, only an approved template can go
  out.

The inbox page has push notifications without a third-party service: the Web Push encryption
and the signed sender header, written directly against the specifications, with a self-test
that decrypts what it encrypts.

And one accident, because it is the kind of thing nobody writes down. To check that the page
refuses to send outside the window, a test posted a message to a number whose window was
assumed to be closed. It was open. The number belonged to the platform's own notification
account, which received the letter "x" from my company. **Never test a refusal against a
real recipient.**

## Staying up

The server runs under a small supervisor that restarts it, and a scheduled task checks the
supervisor every ten minutes. Both need a logged-in session, so nothing runs before the first
login after a reboot. If the workstation is off altogether, the provider falls back to a
static voicemail hosted somewhere else; those recordings have to be collected by hand.
WhatsApp messages that arrive while the machine is down are pulled from the provider's log at
the next start. They are not answered in the meantime, and I would rather have that than an
always-on machine pretending to be me.

## What is not built

- Handing a spoken task to an agent session and getting a call back when it is done. Today
  the hand-off is a line in the notes file, which an agent at the desk picks up. Dictating
  slowly, in a fixed order, turned out to matter more than any model choice.
- A proper turn-detection model instead of a silence timer.
- Sending anything on a spoken OK. That comes last, if at all.

## If you want to build one

- **Start with outbound status calls.** No server, one evening, immediately useful.
- **Budget the silence**, not the tokens: cache warm-up, first clause, short pause, filler.
- **Decide who may reach the model before you give it tools**, and build a path with no
  model in it for everyone else.
- **Cap the answer length.** It is a phone.
