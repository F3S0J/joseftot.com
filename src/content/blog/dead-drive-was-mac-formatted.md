---
title: "The dead drive was just Mac-formatted"
description: "A 2 TB external disk that Windows had shown without a drive letter for years. It was healthy the whole time. How to tell from the partition type, how to read it for free, and why its big ZIP files look corrupt when they are not."
date: 2026-10-11T13:00:00
tags: [field-notes, windows, recovery]
---

I had a 2 TB external drive in a drawer, labelled "old HD", that I believed was dead. Windows
saw a disk but gave it no drive letter. Explorer showed nothing. For years the plan was "send
it to a recovery service one day".

It was never broken. It was formatted on a Mac.

## How to tell in one minute

Windows has no driver for Apple's file systems, so a Mac disk looks like a disk with an
unknown partition: online, healthy, no letter. The partition table says what it really is.
In PowerShell:

```powershell
Get-Disk
Get-Partition -DiskNumber 2 | Select PartitionNumber, Size, GptType
```

The `GptType` of the big partition is the answer:

| GptType starts with | meaning |
|---|---|
| `48465300-0000-11AA-…` | **HFS+** (Mac OS Extended). The first bytes are the letters `HFS` |
| `7C3457EF-0000-11AA-…` | APFS, the newer Mac format |
| `53746F72-6167-11AA-…` | Core Storage, used for encrypted volumes and Fusion drives |

Mine showed a 200 MB EFI partition followed by one large HFS+ partition. That is the standard
layout a Mac writes when it formats a disk. Nothing was damaged.

Two things **not** to do at this point: do not let Windows "initialise" or format the disk
when it offers to, and do not run `chkdsk` on it. Both write to a file system Windows does
not understand.

## Reading it for free

[HFSExplorer](https://github.com/unsound/hfsexplorer) reads HFS+ volumes on Windows. It is
free, open source and needs Java.

```powershell
winget install --id Catacombae.HFSExplorer
```

What cost me time:

- **It must run as Administrator.** Reading a raw physical disk is denied to a normal user,
  and the error does not say so clearly.
- In the device list, pick the entry for the whole disk or the HFS+ partition itself. The
  small first partition is the EFI partition and holds nothing of yours.
- It is read-only, which is what you want. Select folders, extract to a Windows drive.
- **WSL is not a shortcut.** The stock Linux kernel that ships with WSL 2 has no `hfsplus`
  module, so `mount -t hfsplus` fails there.

HFSExplorer does not read APFS. For a disk formatted by a recent Mac you need a different
tool.

## Then the ZIP files were "invalid"

The drive held several large ZIP archives made in 2016 with the Mac's built-in Archive
Utility. Windows Explorer refused every one of them as invalid. After the first scare, this
looked like the corruption I had expected all along.

It was not corruption either. A ZIP file ends with a small record that says where its table of
contents starts. In the classic format that position is a 32-bit number, so it can only count
to 4 GiB. Larger archives are supposed to add a second, 64-bit record. Archive Utility did not
write one. It wrote the 32-bit number and let it **wrap around**.

You can prove it from the last 22 bytes of the file. Decode the offset and the size of the
table of contents and add them: the sum should land exactly 22 bytes before the end of the
file. In these archives it fell short, and the shortfall was an exact multiple of
4,294,967,296. A damaged file does not miss by a round power of two.

**7-Zip reads these archives anyway.** It copes with the wrapped number, warns about a 32-bit
overflow in the headers, and extracts everything with the checksums intact:

```powershell
7z x archive.zip -aoa -y '-x!__MACOSX'
```

The exclusion matters. The `__MACOSX` folder holds one small `._name` companion file for every
real file, with Mac metadata nobody needs on Windows. Left in, they double the file count, and
some of them carry a `.JPG` name and open as broken pictures.

## What came back

419 raw photos, 734 JPEGs and 16 videos, 20 GB, every file verified against its checksum.
Years of pictures that had been one right-click away the whole time.

## The short version

- No drive letter does not mean no data. **Read the partition type first.**
- HFS+ on Windows: HFSExplorer, run as Administrator, read-only.
- "Invalid" ZIP from a Mac, larger than 4 GB: try 7-Zip before you believe it.
- Never initialise, format or `chkdsk` a disk you cannot identify.
