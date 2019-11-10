---
layout: post
title: Portals | Series Introduction
subtitle: Space-bending physics
gh-repo: daniel-ilett/shaders-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, portals, physics, intro]
nice-slug: Portals Series
date: 2019-12-01
idnum: 30
---

Ever since student project *Narbacular Drop* was adopted by Valve and spun into seminal puzzle-platformer *Portal* in 2007, the idea of mind-bending physics in games has captured the imaginations of players and developers alike; games that have followed it such as *Antichamber* and recent release *Manifold Garden* demonstrate that there is still unexplored space in the "brain-tickling physics" genre. The question I've always asked myself is: how could I create *Portal*'s portals from scratch?

This series will explore several complicated concepts: shaders, physics, maths. *Portal* isn't the only game to feature portals, of course - the first article will act as a taster and will feature a portal effect similar to classic *Spyro* - in those games, portals were, visually, just a glimpse at the skybox of another level. Then, we'll ramp things up and move onto constructing *Portal*-style portals piece by piece, starting with non-recursive portals seen in games like *Manifold Garden* and building up to recursion-based portals, as seen in *Portal*. I'll do my best to explain each step in full.

<hr/>

The posting schedule for this series is as follows:

**Part 1**: Spyro Skyboxes | **Coming December 1st** | `Spyro-style Portals`
**Part 2**: Portal Rendering | **Coming December 2nd** | `Camera Positioning`, `Stencil Rendering`
**Part 3**: Matrix Matching | **Coming December 3rd** | `Oblique Near-Plane Projection`
**Part 4**: Portal Momentum | **Coming December 4th** | `Physics`
**Part 5**: Portals in Portals in Portals | **Coming December 5th** | `Recursion`
**Part 6**: Placing Portals | **Coming December 6th** | `Raycasting`
**Part 7**: Prettier Portals | **Coming December 7th** | `Particles`, `Heat-haze`, `Dissolve`
**Part 8**: Light Through Portals | **Coming December 8th** | `Directional Lighting`

As always, there is a [GitHub repository](https://github.com/daniel-ilett/shaders-portal) for the series. Feel free to poke around while development is ongoing.

<hr/>

# Acknowledgements

I'd like to thank my Patreon supporters for making this content possible. [Become a Patron](https://www.patreon.com/danielilett) for $1+ to receive PDF versions of all articles, or $5+ to get certain articles early!

This tutorial series uses the following asset packs - available on the Unity Asset Store:

["Skybox Volume 2 (Nebula)"](https://assetstore.unity.com/packages/2d/textures-materials/sky/skybox-volume-2-nebula-3392) | [**Hedgehog Team**](https://assetstore.unity.com/publishers/1351)
["Robot Sphere"](https://assetstore.unity.com/packages/3d/characters/robots/robot-sphere-136226) | [**Razgrizzz Demon**](https://assetstore.unity.com/publishers/27109)

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>