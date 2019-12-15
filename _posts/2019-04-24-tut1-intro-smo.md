---
layout: post
title: Image Effects | Series Introduction
subtitle: The shaders used in Super Mario Odyssey's Snapshot Mode
bigimg: /img/tut1/intro-banner.jpg
gh-repo: daniel-ilett/smo-shaders
gh-badge: [star, fork, follow]
tags: [shaders, unity, image-effects, intro]
nice-slug: Image Effects Series
date: 2019-04-24
idnum: 2

part-label: i
series-name: Image Effects
---

Shaders are a bit of a passion within a passion for me. Out of everything involved in game development, shaders are the one thing that call out to me the strongest - they're making things pretty with maths! I’ve wanted to improve my skills for a long time, so on top of making experimental games, my Patreon will involve creating tutorial projects for a bunch of shader effects. I hope you’ll stick with me on this journey - I’ll be giving away FREE CODE with each post!

<hr/>

Super Mario Odyssey was one of my absolute favourite games of 2017. Despite being a huge Nintendo fan, I've not got round to playing all of the main-series 3D Mario games yet, so when this game was revealed in the year the Nintendo Switch launched, I was excited to be able to play one at launch - and it certainly didn't disappoint!

Snapshot Mode pauses the game and gives you more control of the camera, letting you frame Mario in the perfect pose. Additionally, you can throw filters on top of the image to tweak or transform how it looks. Those effects are the focus of this first series; how would you recreate those effects using shaders in Unity? Each effect employs the same pattern - render the image as normal and then apply a post-processing shader on top of that image to modify it in any way you want. This tutorial series explores the theory behind each effect and demonstrates the flexibility of these effects.

Look out in the next few days for the launch of this series of tutorials. The first will be a special crash course on how to write shaders in Unity. You can peek at the template project by clicking the GitHub link near the top of this page.

- Part 0: [Shader Primer]({% post_url 2019-04-27-tut1-0-smo-shader-basics %})
- Part 1: [Colour Transforms]({% post_url 2019-05-01-tut1-1-smo-greyscale %})
- Part 2: [Getting Deep]({% post_url 2019-05-04-tut1-2-smo-silhouette %})
- Part 3: [Blurring Algorithms]({% post_url 2019-05-08-tut1-3-smo-blur %})
- Part 4: [Edgy Talk]({% post_url 2019-05-11-tut1-4-smo-edge-detect %})
- Part 5: [Retro Arcade]({% post_url 2019-05-15-tut1-5-smo-retro %})
- Part 6: [Painting Joy]({% post_url 2019-05-18-tut1-6-smo-painting %})
- Part 7: [Wrapping Up]({% post_url 2019-05-22-tut1-7-smo-end %})
