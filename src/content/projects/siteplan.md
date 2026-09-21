---
title: "siteplan"
description: "Scaled site plans (DXF + true-scale PDF) from plain measurements or straight from the Austrian cadastre, built for agents to drive."
status: shipped
year: 2026
stack: ["Python", "ezdxf", "shapely", "BEV cadastre (open data)"]
repo: "https://github.com/F3S0J/siteplan"
order: 4
---

Describe a plot in JSON (parcels, roads, buildings, dimensions) and get a DXF any CAD program
opens, plus a print-ready PDF at a verified true scale. Or give it a cadastral municipality and
plot number and it pulls the real boundary and the neighbours from the federal cadastre.

A separate checker re-measures the finished drawing (areas, setbacks, containment), because
every real error was invisible from inside the generator.

Write-up: [CAD for agents: how a scaled plan gets a plot onto the road](/blog/cad-for-agents/).
