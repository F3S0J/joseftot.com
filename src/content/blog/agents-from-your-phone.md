---
title: "Run your agents from your phone with Tailscale"
description: "A private network between your phone and your workstation, SSH with keys, and a session that survives a dead zone on the train. No open ports, no cloud VM. Plus the one bug that ate an evening."
date: 2026-09-21T14:00:00
tags: [agents, networking, howto]
---

Coding agents do their best work on a machine with your repos, your tools and your keys on it.
That is usually a desktop at home or at the office. But agents also work in long stretches
where you mostly need to *look in*: approve a step, answer a question, start the next job. You
don't need to sit at the desk for that.

What you want is a terminal on that machine, from your phone, from anywhere, without exposing
anything to the internet. That takes about twenty minutes.

<figure>
<svg class="diagram" viewBox="0 0 720 170" role="img" aria-label="Phone with SSH client connects through the Tailscale private network to the workstation's SSH server, where the agent runs in a persistent session; no ports are open on the router">
<rect class="box" x="10" y="40" width="150" height="80"/><text x="85" y="66" text-anchor="middle">phone</text><text class="d" x="85" y="86" text-anchor="middle">SSH client</text><text class="d" x="85" y="104" text-anchor="middle">private key</text>
<rect class="box" x="560" y="40" width="150" height="80"/><text x="635" y="66" text-anchor="middle">workstation</text><text class="d" x="635" y="86" text-anchor="middle">sshd · keys only</text><text class="d" x="635" y="104" text-anchor="middle">agent in tmux</text>
<path class="ac" d="M160 80H560"/>
<text x="360" y="68" text-anchor="middle">Tailscale (WireGuard), 100.x.y.z</text>
<text class="d" x="360" y="100" text-anchor="middle">encrypted, device-to-device</text>
<path class="ln" d="M300 140h120" stroke-dasharray="4 4"/><text class="d" x="360" y="160" text-anchor="middle">router: no open ports</text>
</svg>
<figcaption>The phone and the workstation join the same private network. SSH only listens there, and only accepts keys.</figcaption>
</figure>

## 1. A private network: Tailscale

[Tailscale](https://tailscale.com) builds an encrypted WireGuard network between your own
devices. Install it on the workstation and on the phone, sign in with the same account, and
each device gets a stable private address (`100.x.y.z`) and a name. It punches through NAT
on its own, so no port forwarding on the router and no public IP. The free plan is plenty for
one person.

On a Windows workstation, turn on **Run unattended** in the Tailscale menu. Otherwise the
connection only comes up after someone logs in at the desk, which is exactly when you don't
need it.

## 2. An SSH server that only takes keys

**Linux / macOS**: `sshd` is usually there already; make sure it's enabled.

**Windows** ships OpenSSH Server as an optional feature. In an admin PowerShell:

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Set-Service sshd -StartupType Automatic
Start-Service sshd
# land in PowerShell instead of cmd.exe
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell `
  -Value "C:\Program Files\PowerShell\7\pwsh.exe" -PropertyType String -Force
```

Then keys, not passwords:

1. In the phone's SSH app (Termius, Blink, JuiceSSH, anything), generate an **ed25519** key
   and copy the public half.
2. On the workstation, add it to `~/.ssh/authorized_keys`. On Windows, if your account is an
   administrator, the file that counts is `C:\ProgramData\ssh\administrators_authorized_keys`,
   and it must be readable only by Administrators and SYSTEM, or sshd silently ignores it.
3. In `sshd_config`, set `PasswordAuthentication no` and restart the service.

Connect from the phone to the workstation's Tailscale name. That's it.

## 3. A session that survives the tunnel

Mobile connections drop. If your agent is running in the SSH session itself, a dead zone kills
the job. Run it inside **tmux** (Linux, macOS, or WSL on Windows):

```bash
tmux new -s agent        # start once, run the agent inside
# ...connection drops...
tmux attach -t agent     # back exactly where you were
```

Any terminal agent works this way: coding agents, your own scripts, a long build. The phone
is just a window onto a session that keeps running at home.

## 4. Keep the machine awake

A workstation that goes to sleep after 30 minutes is not reachable. Set the power plan so it
doesn't sleep while plugged in, or at least allow wake on network. Check this before you rely
on it from the other side of the country.

## The bug that ate an evening

My setup showed "Connecting…" forever. Tailscale said both devices were online. Ping worked in
one direction only. The Windows firewall rules were fine. The antivirus suite's firewall
service showed as *stopped*.

It was still the antivirus. Some security suites install kernel-level network filters that keep
dropping inbound traffic on the Tailscale adapter even when their firewall component claims to
be off. The way to see it is to stop guessing and count packets: do bytes arrive on the adapter
or not? When they arrive and nothing answers, something between the adapter and sshd is eating
them. Uninstalling the suite (Windows Defender is still there) fixed it instantly.

## Why bother

Because agents change what "being at work" means. The expensive part of agent work is not
the typing. It is being available for the thirty seconds of judgement it needs every twenty
minutes. With a private network and a persistent session, those thirty seconds can happen on
a train, in a waiting room, or on the couch.

## Checklist

- Tailscale on both devices, *Run unattended* on Windows
- SSH server on, **keys only**, password login off
- No ports open on the router: nothing listens on the public internet
- Agent runs inside tmux
- Workstation doesn't sleep
- Lose your phone? Remove it from the Tailscale admin console and delete its key from
  `authorized_keys`. Access is gone in seconds.
