---
layout: post
title: Unity Basics - How to Reverse Engineer Shader Effects
subtitle: Software Engineering
bigimg: /img/unity-basics/part4-bigimg.jpg
hdrimg: /img/unity-basics/part4-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, basics, shader-graph, reverse-engineering]
nice-slug: Reverse Engineering Effects
date: 2021-04-12
idnum: 70

part-label: 3
series-name: Unity Basics
---

A lot of people seem to struggle with shaders. After following a few tutorials, I still see people unsure where to go from there, and I've certainly been in that position myself! It takes time to develop the skills to analyse effects made by others and take apart how those effects work, and probably even longer to come up with original effects yourself. In this tutorial, I'll aim to uncover some tips you can use when making effects! We'll look at an effect I've made before, and analyse its visual appearence to try and reverse-engineer how it was made. Using this knowledge, hopefully you'll be able to adopt this mindset when looking at games you've played so you'll be able to recreate some of the set pieces from them.

{: .box-note}
Unity Basics aims to teach you a little part of Unity in an easy-to-understand and clear format.

{: .box-warning}
This tutorial is aimed at people who have used a bit of Shader Graph before, and you're looking for tips to take what you've learned and build your own effects.

By the way, I have a [Discord server](https://discord.gg/tPQEUwPpb3) for people who are making things using shaders! If you want to share something you've worked on, see what others are doing, ask questions about shaders or otherwise just wanna hang out with others who like shaders, come join us!

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

## Basic colours

Let's look at the dissolve effect when the actual dissolve is not yet active. The object seems to use Unity's built-in lighting systems and a diffuse colour - we'll probably want to use a Lit or PBR Shader Graph with a base colour or base texture. We can tell, because there's lighting variation on the sphere. We can see highlights and shadowing. That's about all there is to say about the effect when there's no dissolve yet! We'll create a new lit shader in URP using *Create -> Shader -> Universal Render Pipeline -> Lit Shader Graph*, or in older versions of Unity, it might be *Create -> Shader -> PBR Graph*. Then we can quickly add a `Base Color` property and connect it directly to the **Base Color** output.

<img data-src="/img/unity-basics/part4-no-dissolve.jpg" class="center-image lazyload" alt="Effect Without Dissolve." title="Who can solve the mystery of the missing dissolve?">
*Who can solve the mystery of the missing dissolve?*

## Dissolving the mesh

Things get a lot more interesting when we start playing the effect. The shader can clearly delete parts of the mesh, but each part that remains is fully opaque. From this, we can conclude that our shader can use opaque rendering - as opposed to transparent rendering, which is more expensive - and we can cull (i.e. remove) those pixels above the dissolve cutoff threshold. We'll come back to this in a second.

<img data-src="/img/unity-basics/part4-dissolve.jpg" class="center-image lazyload" alt="Effect With Dissolve." title="Gets a glowing recommendation from me.">
*Gets a glowing recommendation from me.*

When we cut off those bits of the mesh, we can see the inside parts of the shell of the mesh. This suggests the shader uses **two-sided rendering**, which is an option in the Graph Settings. Make sure that's ticked, and Unity will render both the front and back sides of each triangle in the mesh. Usually, Unity only renders the front side as an optimisation.

<img data-src="/img/unity-basics/part4-two-sided.jpg" class="center-image lazyload" alt="Two-Sided Rendering." title="At least this tutorial isn't one-sided.">
*At least this tutorial isn't one-sided.*

Clearly, the shader isn't just setting a single height value for the cutoff, because the lip of the sphere is incredibly uneven. We can probably use a noise offset plus a global height value for the cutoff, which is great because Unity provides a few noise nodes out of the box. There's a few areas of the mesh that are floating, which supports the idea it's a 2D noise value that's being used. We can use the `Simple Noise` node for that.

At this stage, it's a good idea to think not only about the things we can see on the reference object, but also the kind of customisation options an end-user might want on the material. The Simple Noise node takes a Scale input to control the size of the noise clouds, so that's a great place to start. I'll create a `Noise Scale` property of type `Float` to control the granularity of noise around the edges. I also want the user to be able to control how far the noise extends past the cutoff height, so I'll add a second `Float` property called `Noise Strength`.

A lot of the shader design process revolves around what a user might want - which options and features would make this shader more useful in a general situation? Abstracting the scale and strength of the noise into these variables makes the shader far more customisable than it might otherwise be!

We've established that we need to set a height value for the cutoff, but we haven't discussed how we might add that yet. Let's add a property called `Cutoff Height`, of type `Float`. We can `Multiply` the output from our `Simple Noise` node (with `Noise Scale` in its **Scale** input) by `Noise Strength`, `Add` that to the `Cutoff Height` property, and that should give us a cutoff threshold value.

<img data-src="/img/unity-basics/part4-noise-calculation.jpg" class="center-image lazyload" alt="Noise Calculations." title="I can't hear you over the noise.">
*I can't hear you over the noise.*

We need to compare that somehow to the height of the pixel being rendered. We're going to use **Object Space**, where every position on the mesh is defined relative to the centre point of the mesh itself. That means we'll be able to specify a cutoff height which will move with the object, although you may prefer using world space, where the cutoff height remains fixed if the object moves. We can use the `Position` node to get the currently-rendered pixel's position - make sure you set its **Space** to **Object**. We're going to set the output **Alpha** of the shader to 0 if this height is above the cutoff threshold we calculated previously, and 1 if it is above, so use a `Split` node on the `Position` output to separate the components of the vector, then drag the **G** component - because **RGBA** corresponds to **XYZW** and we want the height, **Y** - into a `Step` node's **Edge** input. Then, pass the cutoff from before into the **In** input. On the preview, you should see a noisy cutoff pattern - we can output these values directly to the **Alpha** output and set **Alpha Clip Threshold** to 0.5.

<img data-src="/img/unity-basics/part4-alpha-cutoff.jpg" class="center-image lazyload" alt="Alpha Cutoff." title="Step right up for a good ol' alpha cutoff!">
*Step right up for a good ol' alpha cutoff!*

## Glowing Edges

Now we come to the glowing edges around the lip of the effect. For glowing materials like this, we can use the **Emission** output - that's one of the main reasons we chose a **Lit Shader Graph** as out basis for the effect. The usual approach is to connect an HDR colour to the **Emission**. HDR stands for **High Dynamic Range**, and it allows us to give colours an additional intensity value - the higher the value, the more brightly the object glows. We can actually use the same cutoff threshold approach we used previously to define the region which should glow. We will need an additional property called `Glow Width`, of type `Float`, and another called `Glow Color`. That second one should be a `Color`, set to use **HDR** mode rather than **Default** - this enables the intensity options I mentioned. By setting an intensity above 0, we'll start to see glowing.

<img data-src="/img/unity-basics/part4-hdr-glow-color.jpg" class="center-image lazyload" alt="HDR Glow." title="HDR colours are having the glow-up of the year.">
*HDR colours are having the glow-up of the year.*

We can take the threshold value from before and `Subtract` `Glow Width` to act as the second threshold. We will pass this into a second `Step` node in its `In` pin and pass the y-position from before into the `Edge` pin, which gives us the shape we want, but the wrong colours. Pass the output into a `One Minus` node to flip white to black and black to white - now we have the shape we need. `Multiply` by `Glow Color`, plug the result into the **Emission** output, and we've got a glow much like the reference material. We've managed to recreate this shader only by looking at the reference material and not looking at the original graph the material was made with!

<img data-src="/img/unity-basics/part4-complete-material.jpg" class="center-image lazyload" alt="Completed Material." title="I think it looks better than the original!">
*I think it looks better than the original!*

<hr/>

# Conclusion

We've recreated an effect using just the visual elements on the effect itself and a bit of Shader Graph know-how. When it comes to other effects, you'll need to think about other properties of the effect - my Wind Waker water effect, for instance, manipulates the position of the vertices to simulate waves, and other materials such as the ice refraction effect uses textures to drive parts of the refractions. Knowing what Shader Graph provides and what you'll need to create yourself is also important, but I wanted this tutorial to give you a starting point for the sorts of questions you'll need to ask when analysing others' effects.

If you enjoyed this tutorial, check out my Patreon page - by supporting me there, you'll get access to PDF copies of articles which don't contain ads. And you can read them offline, obviously!

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
