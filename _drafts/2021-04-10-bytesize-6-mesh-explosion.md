---
layout: post
title: "Bytesize Gamedev #6 - Mesh Explosion in Shader Graph"
subtitle: 
bigimg: /img/bytesize/part6-bigimg.jpg
hdrimg: /img/bytesize/part6-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, bytesize, mesh, explosion]
nice-slug: Mesh Explosion
date: 2021-04-10
idnum: 68

part-label: 6
series-name: Bytesize Gamedev
---

Everyone knows explosions are cool, and with Shader Graph, we can make our own by blasting a mesh apart. Without looking at the result, of course.

{: .box-note}
Bytesize Gamedev is a series of shorter game development tutorials.

Hang out with me and other shader enthusiasts over on [Discord]((https://discord.gg/tPQEUwPpb3)) and share what you're working on! And check out this tutorial over on YouTube:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/si--oy_OKsg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

Step 1 is to create your mesh. In this example I'll be using an icosphere I made in Blender.

<img data-src="/img/bytesize/part6-blender-mesh.png" class="center-image lazyload" alt="Creating Mesh in Blender." title="Or you can import a mesh from elsewhere.">
*Or you can import a mesh from elsewhere.*

Then we'll need to mess with the mesh import settings and set the **Smoothing Angle** to zero. If we don't do this, individual triangles stay stuck together and al we'll end up doing is inflate the mesh like a bouncy castle.

<img data-src="/img/bytesize/part6-smoothing-angle.png" class="center-image lazyload" alt="Smoothing Angle." title="If this is above 0, some triangles may stay together. That might be what you want, so play around with the values.">
*If this is above 0, some triangles may stay together. That might be what you want, so play around with the values.*

Then create a new **Lit Shader Graph** (*Create -> Shader -> Universal Render Pipeline -> Lit Shader Graph*). Call it `MeshExplosion` or something similar.

<img data-src="/img/bytesize/part6-create-shader.png" class="center-image lazyload" alt="Create Shader." title="You can tell I did this screenshot after, because the completed effect is behind it.">
*You can tell I did this screenshot after, because the completed effect is behind it.*

Add a `Float` property call `Distance`. To make it easier to modify in code, give it a **Reference** of `_Distance`.

<img data-src="/img/bytesize/part6-properties.png" class="center-image lazyload" alt="Properties." title="Only one property this time. You might animate this in code, so the reference makes things easier.">
*Only one property this time. You might animate this in code, so the reference makes things easier.*

Take the `Normal Vector` in **Object Space** and multiply by `Distance`, then add that to `Position` in **Object Space** and output to the **Vertex Position**.

<img data-src="/img/bytesize/part6-explosion-graph.png" class="center-image lazyload" alt="Explosion Graph." title="Not many nodes on this graph!">
*Not many nodes on this graph!*

Now we can play with the `Distance` value in the Inspector!

<img data-src="/img/bytesize/part6-explosion-effect.png" class="center-image lazyload" alt="Explosion Effect." title="For this screenshot, I also made the shader use Two Sided rendering.">
*For this screenshot, I also made the shader use Two Sided rendering.*

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
