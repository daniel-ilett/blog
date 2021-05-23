---
layout: post
title: "Bytesize Gamedev #4 - Easy Refraction"
subtitle: 
bigimg: /img/bytesize/part4-bigimg.jpg
hdrimg: /img/bytesize/part4-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, bytesize, refraction, ice, glass]
nice-slug: Easy Outlines
date: 2021-04-08
idnum: 66

part-label: 4
series-name: Bytesize Gamedev
---

Accurate refraction is difficult to calculate, but we can make a decent approximation using extremely fast techniques. We just need to supply a refraction texture and we can distort the screen's image slightly to mimic for some efficient refractions.

{: .box-note}
Bytesize Gamedev is a series of shorter game development tutorials.

Hang out with me and other shader enthusiasts over on [Discord]((https://discord.gg/tPQEUwPpb3)) and share what you're working on! And check out this tutorial over on YouTube:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/p4QJO6ZqMwk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

For this effect to work, we'll need to enable a couple extra settings in URP. Find your **URP renderer settings** and enable the **Opaque Texture**.

<img data-src="/img/bytesize/part4-opaque-texture.png" class="center-image lazyload" alt="Opaque Texture." title="This will enable the Scene Color node.">
*This will enable the Scene Color node.*

Then we go to *Create -> Shader -> Universal Render Pipeline -> Lit Shader Graph* and name the new graph `Refraction`. nOnce we've created it, you'll need to add these properties:

- A `Texture2D` called `Refraction Map`;
- A `Float` called `Strength`;
- A `Color` called `Tint Color`;
- A `Vector2` called `Tiling`;
- And finally, a `Vector2` called `Offset`.

The only one you need to worry about setting a default value for is Tiling - give it (1, 1) by default.

<img data-src="/img/bytesize/part4-properties.png" class="center-image lazyload" alt="Refraction Properties." title="Not too many properties on this one!">
*Not too many properties on this one!*

<img data-src="/img/bytesize/part4-refraction-map.png" class="center-image lazyload" alt="Refraction Map." title="This is the refraction map, by the way.">
*This is the refraction map, by the way.*

On the graph, we'll start by reading the `Refraction Map` using a `Normal From Texture` node, using the `Tiling` and `Offset` properties in a `Tiling And Offset` node. Then we'll multiply by `Strength` - I found this to be more effective than plugging `Strength` directly into the **Strength** option on `Normal From Texture`.

<img data-src="/img/bytesize/part4-refraction-normals.png" class="center-image lazyload" alt="Refraction Normals." title="The result of this will be used as an offset.">
*The result of this will be used as an offset.*

The next step is to sample the scene texture. Between rendering opaque and transparent objects, Unity keeps the result in a special texture that we can access using the `Scene Color` node - that's why we needed to enable the **Opaque Texture**. We use the `Screen Position` for sampling the texture, but first, we'll add the stuff we calculated in the last step.

<img data-src="/img/bytesize/part4-scene-color.png" class="center-image lazyload" alt="Scene Color." title="This texture gives you the scene after opaque objects have been rendered.">
*This texture gives you the scene after opaque objects have been rendered.*

We can multiply this by a `Tint Color` so that it looks more like glass or ice. Then output to **Base Color**.

<img data-src="/img/bytesize/part4-apply-tint.png" class="center-image lazyload" alt="Apply Tint." title="I usually add a blue tint for ice, or maybe slightly grey for glass.">
*I usually add a blue tint for ice, or maybe slightly grey for glass.*

And the last step is to make sure our material uses transparent rendering - if we don't, the `Scene Color` is just black. We can change this in the **Graph Settings**.

<img data-src="/img/bytesize/part4-transparent.png" class="center-image lazyload" alt="Transparent Surface." title="After doing this, we're clearly done.">
*After doing this, we're clearly done.*

I'd recommend not overdoing it with the effect. Just a little bit of distortion looks great - I set the strength to 0.002.

<img data-src="/img/bytesize/part4-complete.png" class="center-image lazyload" alt="Completed Effect." title="If you distort much more than this, it'll look too strong.">
*If you distort much more than this, it'll look too strong.*

Thanks for reading *Bytesize Gamedev*, your one-stop shop for shorter game development tips, tricks and tutorials!

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

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers for April 2021!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

JP $$\cdot$$ Pablo Ruiz<br/>

Jack Dixon $$\cdot$$ Paul Froggatt $$\cdot$$ Tuomas Männistö $$\cdot$$ Sébastien Perouffe<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ MR MD HARDING $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ Christopher Pereira $$\cdot$$ Harshad $$\cdot$$ James Poole $$\cdot$$ Ming Lei $$\cdot$$ sadizeng $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Arthur H $$\cdot$$ Megan Taylor $$\cdot$$ Takuya $$\cdot$$ "Somebody"
</p>

<hr/>
