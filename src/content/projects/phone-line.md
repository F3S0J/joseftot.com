---
title: "Phone line for agents"
description: "A phone number that calls with a status, answers its owner with a voice assistant running on the workstation, and takes a message from everyone else."
status: active
year: 2026
stack: ["Python", "Twilio", "Silero VAD", "faster-whisper", "Piper", "small language model"]
order: 5.7
---

Three things on one number. Agents can call me with a spoken status when a long job ends. When
I call, a voice assistant answers: speech detection, speech-to-text and the voice all run on
the workstation, and a small language model answers from the agents' own notes. Everyone else
gets a keypad menu and a voicemail that is transcribed locally. No model is in that path.

The same number is a WhatsApp business sender: no auto-reply, agents write drafts, I send.

Write-up, with the latency budget and the traps:
[A phone number for the agents](/blog/phone-line-for-agents/).
