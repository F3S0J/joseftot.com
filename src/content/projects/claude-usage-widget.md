---
title: "claude-usage-widget"
description: "Always-on-top Windows widget for Claude subscription limits, plus an F9 key that shows and hides the Claude Code terminal."
status: shipped
year: 2026
stack: ["PowerShell 5.1", "WPF", "C#", "Win32 RegisterHotKey"]
repo: "https://github.com/F3S0J/claude-usage-widget"
order: 11
---

The numbers `/usage` shows, permanently in the corner of the screen: one bar per limit, with
the time until it resets. It reads the login Claude Code already has, never refreshes it, and
keeps the last good answer so rate limits and restarts don't blank it.

Each weekly row shows how much of the week is left to spend today. Below the bars it reads
the local transcripts for tokens today, their value at API prices, the burn rate, the split
by model and a 7-day chart. Every block can be switched off, and there are themes,
transparency and resizing.

F9 brings the Claude terminal up or puts it away; Shift+F9 opens another session as a tab.

Write-up: [A usage meter for Claude Code that stays on screen](/blog/claude-usage-widget/).
