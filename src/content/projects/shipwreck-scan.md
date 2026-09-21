---
title: "shipwreck-scan"
description: "Open-source screening tool that turns sonar surveys and aerial imagery into a ranked list of possible shipwrecks for an archaeologist to triage."
status: active
year: 2026
stack: ["Python", "NOAA BAG bathymetry", "NAIP imagery"]
order: 1
---

Give it a bounding box or a NOAA survey id, and it returns ranked candidate wreck
polygons with measured error rates attached.

Two detection paths: survey-grade multibeam sonar for turbid water, and
high-resolution optical imagery for clear, shallow water where a hull reads directly
as a shape. Recall is scored against charted wrecks, with a chance-corrected lift
figure, so the numbers mean something.
