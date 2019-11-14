---
layout: post
title: Ultra Effects | Part 5 - Filmic Filters
subtitle: Noisy grain and cinematic bars
bigimg: /img/tut3/part5-banner.jpg
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, filmic, cinematic, noise]
nice-slug: Filmic Filters
date: 2019-11-13
idnum: 28
---

Several games could be described as 'cinematic'. Usually, that means heavy application of film techniques to deliver the story or narrative of the game, although interpretations of the term differ - it's very subjective. It could mean throwing a film grain effect over the screen and using black bars to force the viewport into a wider aspect ratio. It might mean lots of cutscenes. And in this tutorial, we'll take it to mean the first - film grain and black bars! Many of these effects emulate the imperfections of cameras or photographic film, so today we're going to use a **noise function** to recreate the film grain effect.

![Film Camera](/img/tut3/part5-film-camera.jpg){: .center-image }

[Photo by Donald Tong on Pexels](https://www.pexels.com/@donaldtong94)

<hr/>

# Imperfect Film

Before the age of digital film, each frame of a motion picture was captured on sections of a physical photographic film strip. The strip was coated with a thin emulsion containing **silver halide** crystals, which, alongside special dyes, react to light and form the image to be projected. It is those crystals and their varying sizes and distribution across the emulsion layer that cause **film grain** - the appearance of noise and texture on the base image. They also influence the image resolution. In digital photography, these artefacts no longer appear, although they can be digitally recreated and simulated - for some, a generated film grain effect is preferable to a "sterile" digital image.

In this tutorial, we'll create our own noise to overlay on our images. While we could slap any noise function on the image and call it a day, we'll pay special attention to **Perlin noise**. 

## Perlin Noise



![Film Grain](/img/tut3/part5-film-grain-anim.gif){: .center-image }

![Film Bars](/img/tut3/part5-film-grain-bars.jpg){: .center-image }

![Greyscale Film](/img/tut3/part5-film-greyscale.jpg){: .center-image }

![Sepia Film](/img/tut3/part5-film-sepia.jpg){: .center-image }

# Acknowledgements

I'd like to thank my Patreon supporters for making this content possible. [Become a Patron](https://www.patreon.com/danielilett) for $1+ to receive PDF versions of all articles, or $5+ to get certain articles early!

This tutorial series uses the following asset packs - available on the Unity Asset Store:

[Forest - Low Poly Toon Battle Arena / Tower Defense Pack](https://assetstore.unity.com/packages/3d/environments/forest-low-poly-toon-battle-arena-tower-defense-pack-100080) | [**AurynSky**](https://assetstore.unity.com/publishers/17283)

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
