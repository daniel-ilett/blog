---
layout: post
title: 
subtitle: Sneaky Shaders
bigimg: /img/tut5/part13-bigimg.jpg
hdrimg: /img/tut5/part13-banner.jpg
gh-repo: daniel-ilett/shaders-pmd
gh-badge: [star, fork, follow]
tags: [unity, shaders, urp, octocamo]
nice-slug: 
date: 2020-12-25
idnum: 56

part-label: 13
series-name: URP
---

The Octocamo mechanic in *Metal Gear Solid 4: Guns of the Patriots* is an extension of the same mechanic from *MGS3*, with the additional feature where your camouflage *automatically* adjusts to your environment. In this tutorial, we will interact with Unity's terrain system to figure out which texture the player is stood on, then automatically change the texture on the player's camouflage material with a bit of interpolation.

Also check out this same tutorial over on my YouTube channel:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/EwkNOyrk_aQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
</div>

<hr/>

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

JP<br/>

Jack Dixon $$\cdot$$ Tuomas Männistö<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Jesper Kuutti $$\cdot$$ MR MD HARDING $$\cdot$$ Maya Nedeljkovich $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ James Poole $$\cdot$$ Christopher Pereira $$\cdot$$ sadizeng $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Arthur H $$\cdot$$ Megan Taylor $$\cdot$$ Takuya $$\cdot$$ "Somebody"
</p>

<hr/>
