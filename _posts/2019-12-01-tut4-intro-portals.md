---
layout: post
title: Portals | Series Introduction
subtitle: Space-bending physics
bigimg: /img/tut4/intro-portals.jpg
hdrimg: /img/tut4/intro-banner.jpg
gh-repo: daniel-ilett/shaders-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, portals, physics, intro]
nice-slug: Portals Series
date: 2019-12-01
idnum: 30

part-label: i
series-name: Portals
---

Ever since student project *Narbacular Drop* was adopted by Valve and spun into seminal puzzle-platformer *Portal* in 2007, the idea of mind-bending physics in games has captured the imaginations of players and developers alike; games that have followed it such as *Antichamber* and recent release *Manifold Garden* demonstrate that there is still unexplored space in the "brain-tickling physics" genre. The question I've always asked myself is: how could I create *Portal*'s portals from scratch?

<img data-src="/img/tut4/intro-portals.jpg" class="center-image lazyload" alt="Portal 2">

*Image from Portal 2.*

This series will explore several complicated concepts: shaders, physics, maths. *Portal* isn't the only game to feature portals, of course - the first article will act as a taster and will feature a portal effect similar to classic *Spyro* - in those games, portals were, visually, just a glimpse at the skybox of another level. Then, we'll ramp things up and move onto constructing *Portal*-style portals piece by piece, starting with non-recursive portals seen in games like *Manifold Garden* and building up to recursion-based portals, as seen in *Portal*. I'll do my best to explain each step in full.

The posting schedule for this series is as follows:

**Part 1**: Spyro Skyboxes | [Out now!](https://danielilett.com/2019-12-11-tut4-1-spyro-skyboxes/) | `Spyro-style Portals`
**Part 2**: Portal Rendering | [Out now!](https://danielilett.com/2019-12-14-tut4-2-portal-rendering/) | `Camera Positioning`, `Stencil Rendering`
**Part 3**: Matrix Clipping | [Out now!](https://danielilett.com/2019-12-18-tut4-3-matrix-matching/) | `Oblique Near-Plane Projection`
**Part 4**: Portal Momentum | [Out now!](https://danielilett.com/2020-01-03-tut4-4-portal-momentum/) | `Physics`
**Part 5**: Placing Portals | [Out now!](https://danielilett.com/2020-01-12-tut4-5-placing-portals/) | `Raycasting`, `Rotations`
**Part 6**: Prettier Portals | **Jan 15th** | `Particles`, `Heat-haze`, `Dissolve`
**Part 7**: Portal Recursion | **Jan 18th** | `Recursion`, `Screenspace Sampling`

As always, there is a [GitHub repository](https://github.com/daniel-ilett/shaders-portal) for the series. Feel free to poke around while development is ongoing.

<hr/>

# Acknowledgements

### Assets

This tutorial series uses the following asset packs from various sources:

["Skybox Volume 2 (Nebula)"](https://assetstore.unity.com/packages/2d/textures-materials/sky/skybox-volume-2-nebula-3392) | [**Hedgehog Team**](https://assetstore.unity.com/publishers/1351)
["Robot Sphere"](https://assetstore.unity.com/packages/3d/characters/robots/robot-sphere-136226) | [**Razgrizzz Demon**](https://assetstore.unity.com/publishers/27109)
["Low Poly Hand Painted Dungeon Arch"](https://sketchfab.com/3d-models/low-poly-hand-painted-dungeon-arch-0040f94c8efd43639d8010874e4fefb6) | **BitGem**

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early!

Special thanks to my Patreon backers:

- Gemma Louise Ilett
- Jack Dixon
- Christopher Pereira

And a shout-out to my top Ko-fi supporters:

- Hung Hoang

<hr/>
