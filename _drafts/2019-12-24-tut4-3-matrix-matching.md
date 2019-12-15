---
layout: post
title: Portals | Part 3 - Matrix Matching
subtitle:
bigimg: /img/tut4/part3-banner.jpg
hdrimg: /img/tut4/part3-banner.jpg
gh-repo: daniel-ilett/shaders-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, portals, matrix, clip-plane]
nice-slug: Matrix Matching
date: 2019-12-24
idnum: 33

this-label: 3
series-name: Portals
series-parts:
    -   label: i
        link: https://danielilett.com/2019-12-01-tut4-intro-portals/
    -   label: 1
        link: https://danielilett.com/2019-12-11-tut4-1-spyro-skyboxes/
    -   label: 2
        link: https://danielilett.com/2019-12-14-tut4-2-portal-rendering/
    -   label: 3
        link: https://danielilett.com/2019-12-18-tut4-3-matrix-matching/
---

In the last tutorial, we managed to render a realistic portal using stencil buffers. We skipped over a few things to talk about in future tutorials, but I asked one key question: what happens to all the stuff between the portal camera and the portal surface? Wouldn't the stuff behind the portal get rendered unless we do something to exclude it? The answer is yes - and today we're going to explore how to prevent the scene behind the out-portal being rendered onto the in-portal surface.

<hr/>

# Camera Clipping

Cameras don't render the entire world. We use occlusion culling to ignore objects behind other objects, back-face culling to exclude object geometry facing away from the screen, and frustum culling to 

## Frustum Culling

<hr/>

*Notes for later:*

First of all, if we comment out the bit of code in the middle of `RenderCamera` what we glossed over in this tutorial and run the scene again, the effect won't work properly. That's because we haven't considered the problem of `clipping`. When we place the camera behind 

# Acknowledgements

### Assets

This tutorial series uses the following asset packs from various sources:

["Skybox Volume 2 (Nebula)"](https://assetstore.unity.com/packages/2d/textures-materials/sky/skybox-volume-2-nebula-3392) | [**Hedgehog Team**](https://assetstore.unity.com/publishers/1351)
["Robot Sphere"](https://assetstore.unity.com/packages/3d/characters/robots/robot-sphere-136226) | [**Razgrizzz Demon**](https://assetstore.unity.com/publishers/27109)
["Low Poly Hand Painted Dungeon Arch"](https://sketchfab.com/3d-models/low-poly-hand-painted-dungeon-arch-0040f94c8efd43639d8010874e4fefb6) | **BitGem**

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early!

Special thanks to my Patreon backers:

- Gemma Louise Ilett ($20)
- Jack Dixon ($5)
- Christopher Pereira ($1)

And a shout-out to my top Ko-fi supporters:

- Hung Hoang

<hr/>
