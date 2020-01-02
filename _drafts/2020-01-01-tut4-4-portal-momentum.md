---
layout: post
title: Portals | Part 4 - Portal Momentum
subtitle:
bigimg: /img/tut4/part4-banner.jpg
hdrimg: /img/tut4/part4-banner.jpg
gh-repo: daniel-ilett/shaders-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, portals, physics, momentum]
nice-slug: Portal Momentum
date: 2019-12-28
idnum: 34
---

What happens when an object travels through a portal? There are tons of videos and articles online discussing the conservation of momentum when portals are in operation. Some common thought experiments include "what happens if a portal moves into another portal" or "what happens when a portal crushes an object", but it's simpler to resirict things to non-moving portals - as games often do. It's easier to design around a smaller possibility space so there's fewer cases to program. Thus, the portals in our universe can't move, and the only momentum we must consider is that of the object travelling through the portal.

# Breaking the Law

Let's talk basic physics. The **momentum** of an object is the product of its mass and velocity and in a closed system, the law of conservation of momentum stipulates that the total momentum stays constant. If a 5kg mass lurches to the left at a velocity of 2 meters per second, a mass of 10kg should lurch to the right at a speed of one meter per second to compensate. Now think of an object entering a portal travelling to the right and exiting a portal facing upwards - in order to conserve momentum, the portals (or anything else in the system) should also move to the left and downwards respectively. But the portals are supposedly stationary, so perhaps they have a near-infinite mass and move a negligible distance. That'd probably create a black hole and destroy the entire game.

But we're getting ahead of ourselves. Games are about suspending the player's disbelief. It's fun to think about how portals in *Portal* would actually work, but as game designers we can just say "thing goes in, thing comes out" and leave the thinking to the players. Our portals are made of hand-wave-ium and objects conserve their local momentum upon portal entry.

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
