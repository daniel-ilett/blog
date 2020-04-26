---
layout: post
title: 2D Outlines in Shader Graph and URP
subtitle:
bigimg: /img/tut5/part6-bigimg.jpg
hdrimg: /img/tut5/part6-banner.jpg
gh-repo: daniel-ilett/2d-outlines-urp
gh-badge: [star, fork, follow]
tags: [unity, shaders, 2d, outline, urp, shader-graph]
nice-slug: URP 2D Outlines
date: 2020-04-29
idnum: 47

part-label: 6
series-name: URP
---

Outlines are an extremely popular method for making objects stand out in games. Plenty of developers choose to add outlines to advance an aesthetic like a comic book style. In this tutorial, we'll take a SpriteRenderer and add outlines to it using Shader Graph. As always, the source code for this shader is available [on GitHub](https://github.com/daniel-ilett/2d-outlines-urp).

# Outline Shader

The approach we'll take for this effect will be familiar to anyone who has used the `Outline` component bundled with Unity's UI system. That script works by duplicating the UI element's visual elements four times, tinting the duplicates a colour (usually black), then moving them up, down, left and right very slightly. Since the duplicates are drawn behind the UI element, it looks as if that element has an outline. We're going to do something similar in Shader Graph for sprites. We'll sample the texture normally for the base colour. Then, we'll sample the pixels to the top, bottom, left and right of the current pixel and add together their alpha values. Assuming everything is fully opaque or fully transparent for a second, if the main texture sample has an alpha value of zero and the total alpha of the surrounding four pixels is above zero, then the current pixel is just one off the edge of the opaque section of the sprite and it should be drawn in the outline colour.

# Acknowledgements

### Assets

This tutorial uses the following asset pack:

["Bandits - Pixel Art"](https://assetstore.unity.com/packages/2d/characters/bandits-pixel-art-104130) | [**Sven Thole**](https://assetstore.unity.com/publishers/31468)

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

Special thanks to my Patreon backers:

- Gemma Louise Ilett
- Jack Dixon
- BVR
- John Selig
- Pablo Ruiz
- Chris Sims
- FonzoUA
- Jason Swearingen
- Shaun Wall
- Christopher Pereira
- Patrick A Farnach
- Zachary Alstadt

And a shout-out to my top Ko-fi supporters:

- Hung Hoang
- Mysterious Anonymous Person

<hr/>
