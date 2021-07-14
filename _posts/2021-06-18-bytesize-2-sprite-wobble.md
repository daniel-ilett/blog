---
layout: post
title: "Bytesize Gamedev #2 - Sprite Wobble in Shader Graph"
subtitle: Dancing drawings
bigimg: /img/bytesize/part2-bigimg.jpg
hdrimg: /img/bytesize/part2-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, bytesize, sprite]
nice-slug: Sprite Wobble
date: 2021-06-18
idnum: 65

part-label: 2
series-name: Bytesize Gamedev
---

Some games like [scribbl.io](https://skribbl.io/) have a cute sprite 'wobble' effect, with a two-frame animation. In this tutorial, we will implement that same effect in Shader Graph!

{: .box-note}
Bytesize Gamedev is a series of shorter game development tutorials.

Hang out with me and other shader enthusiasts over on [Discord]((https://discord.gg/tPQEUwPpb3)) and share what you're working on! And check out this tutorial over on YouTube:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/xDCRah7BbIo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
</div>

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5101496396569275"
     data-ad-slot="3740606711"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

<hr/>

# Sprite Wobble

Start by creating a new Sprite Unlit graph via *Create -> Shader -> 2D Renderer -> Sprite Unlit Graph (Experimental)* - on newer Unity versions, this is *Create -> Shader -> Universal Render Pipeline -> Unlit Graph*.

<img data-src="/img/bytesize/part2-new-shader.jpg" class="center-image lazyload" alt="New Shader." title="Gotta start somewhere.">
*Gotta start somewhere.*

We'll create four properties: `Main Texture`, a regular `Texture2D`; `Flow Map`, another `Texture2D`; `Strength`, a `Vector1`/`Float` with a default of `0.005`; and `Speed`, another `Vector1`/`Float` with a default of `4`.

<img data-src="/img/bytesize/part2-properties.jpg" class="center-image lazyload" alt="Properties." title="A few basic properties is all we need!">
*A few basic properties is all we need!*

Then we need a clock. I'm going to make mine use 4 frames of animation. Take a `Time` node's **Time** output, `Multiply` it by `Speed`, and then `Modulo` the result by 4. `Floor` that, then `Divide` by 4.

<img data-src="/img/bytesize/part2-clock.jpg" class="center-image lazyload" alt="Animation Clock." title="Better than TikTok.">
*Better than TikTok.*

That's going to become a UV offset. Funnel the clock result into a `Tiling And Offset` node's **Offset** pin, with the **UV0** channel in the **UV** input.

<img data-src="/img/bytesize/part2-uv-offset.jpg" class="center-image lazyload" alt="UV Offset." title="This only works if your flow map is set to repeat!">
*This only works if your flow map is set to repeat!*

Connect the modified UVs to the **UV** input of a `Normal From Texture` node, with the `Flow Map` in its **Texture** slot. This will generate offset vectors for the 'wobble'. `Multiply` by `Strength`.

<img data-src="/img/bytesize/part2-flow-map.jpg" class="center-image lazyload" alt="Flow Map." title="You could alternatively use Strength in the Normal From Texture's input.">
*You could alternatively use Strength in the Normal From Texture's input.*

Add these offset vectors to a `UV` node, then use the result in the **UV** field on a `Sample Texture 2D` node. That node will be sampling the `Main Texture`. Then we can output its result to the Color field on the Master node, and we're done!

<img data-src="/img/bytesize/part2-color-output.jpg" class="center-image lazyload" alt="Color Output." title="Ignore the weird preview on Sample Texture 2D - it ignores alpha for some reason.">
*Ignore the weird preview on Sample Texture 2D - it ignores alpha for some reason.*

Thanks for reading Bytesize Gamedev, where I bring you short game development tips in an easy to digest format!

<hr/>

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers for June 2021!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

JP<br/>

Jack Dixon $$\cdot$$ Paul Froggatt $$\cdot$$ Sébastien Perouffe<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ Christopher Pereira $$\cdot$$ Harshad $$\cdot$$ James Poole $$\cdot$$ Lee Miller $$\cdot$$ Ming Lei $$\cdot$$ sadizeng $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Arthur H $$\cdot$$ Megan Taylor $$\cdot$$ Takuya $$\cdot$$ "Somebody"
</p>

<hr/>
