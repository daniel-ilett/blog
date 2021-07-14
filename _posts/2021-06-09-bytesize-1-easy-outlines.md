---
layout: post
title: "Bytesize Gamedev #1 - Easy Outlines in Shader Graph"
subtitle: Getting round to it
bigimg: /img/bytesize/part1-bigimg.jpg
hdrimg: /img/bytesize/part1-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, bytesize, outlines]
nice-slug: Easy Outlines
date: 2021-06-09
idnum: 64

part-label: 1
series-name: Bytesize Gamedev
---

There are a lot of approaches you can take to make outlines for 3D objects in Unity. Today, we're going to explore a time-tested, super easy approach for outlines, translated to Shader Graph!

{: .box-note}
Bytesize Gamedev is a series of shorter game development tutorials.

Hang out with me and other shader enthusiasts over on [Discord]((https://discord.gg/tPQEUwPpb3)) and share what you're working on! And check out this tutorial over on YouTube:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/s_P3dVZvVxY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

# Easy Outlines

We'll start by creating a new graph by right-clicking in the Project View and selecting *Create -> Shader -> Universal Render Pipeline -> Unlit Shader Graph* (or *Create -> Shader -> Unlit Graph* on older Unity versions).

<img data-src="/img/bytesize/part1-create-shader.jpg" class="center-image lazyload" alt="Create Shader." title="We want an unlit shader because the outline should have a block colour.">
*We want an unlit shader because the outline should have a block colour.*

We can set the output colour to black. Or, you could make this into a property if you want.

<img data-src="/img/bytesize/part1-black-color.jpg" class="center-image lazyload" alt="Black Main Color." title="The outline will just be a single colour.">
*The outline will just be a single colour.*

Then we need to enable double-sided rendering. On older Unity versions, we use the drop-down cog menu on the master node. On newer versions, we just choose the Graph Settings. Either way, tick the "Two Sided" box.

<img data-src="/img/bytesize/part1-two-sided.jpg" class="center-image lazyload" alt="Two Sided Rendering." title="There's two sides to every story.">
*There's two sides to every story.*

Now we'll disable front-facing triangles so that only back-faces are visible. Add an `Is Front Face` node, then pass it into the **Predicate** input on a `Branch` node - the **True** and **False** inputs are 0 and 1 respectively. That gets passed into the **Alpha** field on the Master node, and the **Alpha Clip Threshold** is set to 0.5.

<img data-src="/img/bytesize/part1-remove-front.jpg" class="center-image lazyload" alt="Remove Front Faces." title="Pixels with alpha below Alpha Clip Threshold are deleted.">
*Pixels with alpha below Alpha Clip Threshold are deleted.*

Now we'll extend the shape of the mesh along its surface normals. Start by adding an `Outline Thickness` property - it's a `Float`/`Vector1`.

We'll take a `Normal Vector` node - in **Object** space - and `Normalize` it, so its length is 1. We can `Multiply` by `Outline Thickness`, then we'll `Add` all this to a `Position` node in **Object** space. This gives us a new position for the vertex, which gets output to the **Vertex Position** pin on the Master.

<img data-src="/img/bytesize/part1-extend-normals.jpg" class="center-image lazyload" alt="Extend Vertex Normals." title="This is normally the easiest way to add outlines.">
*This is normally the easiest way to add outlines.*

Attach a material using this shader to an object - as well as another material using your usual shader for the object - and here's the result:

<img data-src="/img/bytesize/part1-completed-material.jpg" class="center-image lazyload" alt="Completed Material." title="Pikachu looks so happy to be highlighted like this!">
*Pikachu looks so happy to be highlighted like this!*

Thanks for reading Bytesize Gamedev, where I bring you short game development tips in an easy to digest format!

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
