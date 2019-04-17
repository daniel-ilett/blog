---
layout: post
title: Image Effects | Series Introduction
subtitle: The shaders used in Super Mario Odyssey's Snapshot Mode
bigimg: /img/tut1/intro-banner.png
tags: [shaders, unity, image-effects, intro]
nice-slug: Image Effects Series
date: 2019-04-11 23:00:00
---

Shaders are a bit of a passion within a passion for me. Out of everything involved in game development, shaders are the one thing that call out to me the strongest - making things pretty with maths! I’ve wanted to improve my skills for a long time, so on top of making experimental games, this Patreon will involve creating tutorial projects for a bunch of shader effects. I hope you’ll stick with me on this journey - if you’re not intrigued yet, I’ll be giving away FREE CODE with each post!

<hr/>

Snapshot Mode in Super Mario Odyssey pauses your game and gives you full control of the camera, letting you frame Mario in the perfect pose. Additionally, you can throw filters on top of the image to tweak or transform how it looks. Those effects are the focus of this first series; how would you recreate the effects using shaders in Unity? Each effect employs the same pattern - render the image as normal and then apply a post-processing shader on top of that image to modify it in any way you want. This tutorial series explores the theory behind each effect and demonstrates the flexibility of these effects. By the end, you’ll be able to create fun effects like these!

Look out in the next few days for the launch of this series of tutorials. The rest of this post will outline some of the basics of image effects in Unity and some of the fundamentals of shader-writing.

- Part 0: [Shader Primer]({% post_url 2019-04-12-tut1-0-smo-shader-basics %})
- Part 1: [Colour Transforms]({% post_url 2019-04-12-tut1-1-smo-greyscale %})
- Part 2: [Getting Deep]({% post_url 2019-04-12-tut1-2-smo-silhouette %})
- Part 3: [Blurring Algorithms]({% post_url 2019-04-12-tut1-3-smo-blur %})
- Part 4: [Edgy Talk]({% post_url 2019-04-12-tut1-4-smo-edge-detect %})
