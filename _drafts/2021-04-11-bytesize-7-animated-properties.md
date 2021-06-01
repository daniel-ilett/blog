---
layout: post
title: "Bytesize Gamedev #7 - Animated Properties"
subtitle: 
bigimg: /img/bytesize/part7-bigimg.jpg
hdrimg: /img/bytesize/part7-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, bytesize, animation, properties]
nice-slug: Animated Properties
date: 2021-04-11
idnum: 69

part-label: 7
series-name: Bytesize Gamedev
---

Once you've created your shader, you'll probably have a bunch of properties on it. But how do we control those properties at runtime? You could use a script, sure, but it might find Unity's animation tools more useful.

{: .box-note}
Bytesize Gamedev is a series of shorter game development tutorials.

Hang out with me and other shader enthusiasts over on [Discord]((https://discord.gg/tPQEUwPpb3)) and share what you're working on! And check out this tutorial over on YouTube:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/E8PasPdW70k" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

Let's start with a shader which uses a few properties, some of which need to be animated at runtime. Here I'm using an old `Hologram` shader.



Once you've attached the shader to an object, go ahead and create a new animation on the object.



In the **Animation** window, click **Add Property** and pick one of your shader properties. In this case, I chose `Glitch Strength`.



Start recording the animation using the red dot. Once you've done that, you can add new keyframes on the animation timeline and tweak the shader's properties on each keyframe. Right-click the keyframe icons for more options.



And that's how you can use the **Animator** alongside shaders! This works for conventional shaders too, not just Shader Graph. Thanks for reading *Bytesize Gamedev*, your one-stop shop for shorter game development tips, tricks and tutorials!

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
