---
layout: post
title: Unity Basics - How to Reverse Engineer Shader Effects
subtitle: 
bigimg: /img/unity-basics/part3-bigimg.jpg
hdrimg: /img/unity-basics/part3-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, basics, shader-graph]
nice-slug: Reverse Engineering Effects
date: 2021-03-30
idnum: 61

part-label: 3
series-name: Unity Basics
---

{: .box-note}
Unity Basics aims to teach you a little part of Unity in an easy-to-understand and clear format.

{: .box-warning}
This tutorial is aimed at people who have used a bit of Shader Graph before, and you're looking for tips to take what you've learned and build your own effects.

A lot of people seem to struggle with shaders. After following a few tutorials, I still see people unsure where to go from there, and I've certainly been in that position myself! It takes time to develop the skills to analyse effects made by others and take apart how those effects work, and probably even longer to come up with original effects yourself. In this tutorial, I'll aim to uncover some tips you can use when making effects! We'll look at an effect I've made before, and analyse its visual appearence to try and reverse-engineer how it was made. Using this knowledge, hopefully you'll be able to adopt this mindset when looking at games you've played so you'll be able to recreate some of the set pieces from them.

Also check out this tutorial on my YouTube channel maybe? Remember to subscribe too!

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/u9pbpypdq0Q" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

# Reverse Engineering the Dissolve Effect

Let's look at the dissolve effect when the actual dissolve is not yet active. The object seems to use Unity's built-in lighting systems and a diffuse colour - we'll probably want to use a Lit or PBR Shader Graph with a base colour or base texture. We can tell, because there's lighting variation on the sphere. We can see highlights and shadowing. That's about all there is to say about the effect when there's no dissolve yet! We'll create a new lit shader in URP using *Create -> Shader -> Universal Render Pipeline -> Lit Shader Graph*, or in older versions of Unity, it might be *Create -> Shader -> PBR Graph*. Then we can quickly add a `Base Color` property and connect it directly to the **Base Color** output.

<hr/>

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers for January 2021!

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
