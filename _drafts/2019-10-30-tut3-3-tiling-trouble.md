---
layout: post
title: Ultra Effects | Part 3 - Tiling Trouble
subtitle: Pixelating and overlaying textures
bigimg: /img/tut3/part3-banner.png
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, tiling, textures]
nice-slug: Tiling Trouble
date: 2019-10-30
idnum: 25
---

Mosaics have their roots in ancient culture. Floor mosaics comprised of tiny squares of stone and glass were commonly used as decorative art in the ancient world and are still used as a form of artistic expression in modern times. Perhaps you could even argue that pixel art is a type of digital mosaic born out of technical limitations! That's not as silly a suggestion as you'd think - and we're going to prove it today by turning arbitrary images into mosaics by using pixelation together with a tiled texture overlay.

![Floor Mosaic](/img/tut3/part3-floor-mosaic.jpg){: .center-image }

[Photo found on Pixabay](https://pixabay.com/photos/mosaic-ruins-ephesus-ancient-roman-315841/)

<hr/>

# Little squares

Contemporary display technology already displays your image as a series of tiny squares - pixels. This would be a boring tutorial if we left it there, so we're going to let the user specify how many tiles should be visible on the screen and adjust the colour of the pixels within those tiles accordingly. There are several ways to do that - a shader could aggregate the colours within those tiles - but by far the easiest way to do this is outside of shaders: we'll use scripting to decrease the resolution of the texture while leaving it blocky.

<hr/>

# Conclusion

<hr/>

# Acknowledgements

I'd like to thank my Patreon supporters for making this content possible. [Become a Patron](https://www.patreon.com/danielilett) for $1+ to receive PDF versions of all articles, or $5+ to get certain articles early!

This tutorial series uses the following asset packs - available on the Unity Asset Store:

[Forest - Low Poly Toon Battle Arena / Tower Defense Pack](https://assetstore.unity.com/packages/3d/environments/forest-low-poly-toon-battle-arena-tower-defense-pack-100080) | [**AurynSky**](https://assetstore.unity.com/publishers/17283)

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
