---
layout: post
title: Snow Layers in Unity Shader Graph and URP
subtitle: Snow Way Out
bigimg: /img/tut5/part16-bigimg.jpg
hdrimg: /img/tut5/part16-banner.jpg
gh-repo: daniel-ilett/shaders-wall-cutout
gh-badge: [star, fork, follow]
tags: [unity, shader-graph, snow, ice]
nice-slug: Snow Layers
date: 2021-03-25
idnum: 61

part-label: 16
series-name: URP
---

Snow levels are a mainstay in videogame culture. From the infamous 'ice level' in seemingly every platformer, to the more generic Winter setting of other genres, developers aren't shy to slap a bit of frozen rain on the ground. In this tutorial, we're going to use Shader Graph to build a snow effect in which the snow forms piles over time, and we'll also be able to control the direction the snow attaches to objects.

{: .box-warning}
This tutorial is aimed at people who have at least some experience with Shader Graph. We are using Unity 2020.1 and URP/Shader Graph 10.2.2.

Check out this tutorial over on YouTube too!

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/4wHnk-6ktPI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

# Snow Layers

I’m using Unity 2020.2 and URP for this tutorial, and we’re going to start off by right-clicking in the Project window and selecting *Create -> Shader -> Universal Render Pipeline -> Lit Shader Graph*, because I want to use Unity’s lighting system automatically. I also want to give special attention to the cabin model, which is the [Survival Old House by Nikolay Federov](https://assetstore.unity.com/packages/3d/environments/urban/survival-old-house-55315?aid=1101lfDLn) (affiliate link). 

The first step is adding all of the properties that are nothing to do with snow, including:
- The `Base Color` and `Base Texture` for the 'un-snowed' bits
- A `Normal Texture` and `Smoothness Texture` for extra lighting detail
- A `Normal Strength` `Float` if we want stronger or weaker normal mapping
- `Tiling` and `Offset` `Vector2`s to control the UV mapping Their defaults should be `(1, 1)` and `(0, 0)` respectively.

I've prefixed all their names with `Base` so that we don't get mixed up between them and the snow properties.

<img data-src="/img/tut5/part16-base-properties.jpg" class="center-image lazyload" alt="Base Properties." title="We need a few basics to get this shader started.">
*We need a few basics to get this shader started.*

The only property that doesn't interact with the snow is `Normal Texture`, so we're going to deal with that first. Go ahead and plug the `Base Normal Texture` into a `Sample Texture 2D` node with its mode set to **Normal**, while using a `Tiling And Offset` node to make sure the UV mapping is correct. That gets passed into a `Normal Strength` node with the `Base Normal Strength` property plugged into the **Strength** pin. All this gets output to the **Normal** field on the master stack.

<img data-src="/img/tut5/part16-normals.jpg" class="center-image lazyload" alt="Normal Mapping." title="Normally it's not as straightforward as this.">
*Normally it's not as straightforward as this.*

With that out of the way, we can deal with the snow features one by one. The most important characteristic of the snow is that we can control its direction – the snow will usually only land on the top layer of objects, so we will provide a `Vector3` property called `Snow Direction` to describe where the snow will render. On the graph, we can take the `Dot Product` between the `Snow Direction` and the `Normal Vector` of the mesh to give us a measure of how closely the surface matches the snow direction, although I make sure I `Normalize` the `Snow Direction` vector first to make sure its length is 1 – the dot product might act weirdly if this isn’t the case. Then I `Saturate` the output to bound it between 0 and 1.

<img data-src="/img/tut5/part16-dot-product.jpg" class="center-image lazyload" alt="Dot Product." title="You'll see nodes like these dotted around many of my shaders.">
*You'll see nodes like these dotted around many of my shaders.*

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

Next, we will add the ability for snow to form layers over time and build up in clumps. We will need three more properties: `Snow Amount` is a `Float` between 0 and 1 which determines how fully the snow has layered up; `Snow Blend Distance` is another `Float` which controls the size of the blending region between the base texture and the snow layer; and `Buildup Noise Size` is a `Float` which we will use to control the size of the noise clouds used for the snow bunching up.

<img data-src="/img/tut5/part16-snow-properties.jpg" class="center-image lazyload" alt="Snow Properties." title="Hippity hoppity, this snow is my property.">
*Hippity hoppity, this snow is my property.*

The basic approach here is to take a noise cloud and use the `Snow Amount` as a step threshold to determine the shape of the snow clumps. We’ll start by adding two `Simple Noise` nodes and plugging `Buildup Noise Size` into the **Scale** pin on the first one. For the second, we will multiply `Buildup Noise Size` by some amount – I use **Phi**, the golden ratio, or approximately 1.62, by using a `Constant` node. Then, I take the mean average of both by sticking their outputs into a `Lerp` node and setting the **T** value to 0.5. This gets passed into a `Smoothstep` node, which is where we apply a threshold to the noise.

In the **Edge1** pin, I use `One Minus` `Snow Amount`. In the **Edge2** pin, I take that and add `Snow Blend Distance`. The `Smoothstep` node output is 0 whenever **In** is less than **Edge1**, 1 whenever **In** is greater than **Edge2**, and blends between 0 and 1 whenever **In** is between **Edge1** and **Edge2**. The result for this shader is a noise cloud with a fairly hard transition between black and white if `Snow Blend Distance` is low, but with enough of a transition region that it doesn’t look unnatural. We then `Multiply` by the dot product we did before and `Saturate` to bound between 0 and 1.

<img data-src="/img/tut5/part16-snow-buildup.jpg" class="center-image lazyload" alt="Snow Buildup." title="We just need to Smoothstep some noise, and we're golden.">
*We just need to Smoothstep some noise, and we're golden.*

We’re starting to get much of the core calculation out of the way! We’re almost ready to deal with the `Base Texture`, but first I want to add texture variation to the snow. We will add a `Snow Color` property for fairly obvious reasons, plus two `Float`s called `Snow Color Noise Size` and `Snow Color Noise Strength`. These property names are a bit of a mouthful but I hope they’re descriptive enough! 

<img data-src="/img/tut5/part16-more-snow-properties.jpg" class="center-image lazyload" alt="More Snow Properties." title="There's snow end to these properties.">
*There's snow end to these properties.*

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

We’ll take the dot product from before then `Multiply` by `Snow Color`. Then we will add noise to this – `Add` yet another `Simple Noise` node and give it our thanks for carrying this entire shader, then use `Snow Color Noise Size` for its **Scale**. We will `Remap` the values output from this node. The **In Min Max** values – that means the minimum and maximum expected input values – are 0 and 1. We’ll keep the maximum output at 1, but `One Minus` `Snow Color Noise Strength` will become the minimum output. Finally, `Multiply` the `Remap` with the `Snow Color` `Multiply` node we just made.

<img data-src="/img/tut5/part16-snow-variation.jpg" class="center-image lazyload" alt="Snow Variation." title="This adds a tiny bit of texture detail to the snow surface.">
*This adds a tiny bit of texture detail to the snow surface.*

The next step requires no extra properties. Take the `Base Texture` and use a `Sample Texture 2D` node and a `Tiling And Offset` like usual, but keep the **Default** sampling type. `Multiply` that by `Base Color`, and that leaves us with what should be the base albedo colour. We’re going to blend between this and the snow colour, so pass this into the first input on a `Lerp` node and the noisy `Snow Colour` we just created into the second. For the **T** parameter, we need a measure of how snowy this pixel is supposed to be – which is exactly what we calculated before using the `Smoothstep` node! Take the output of that group and plug it in here. Then we can output directly into the `Base Color` on the master stack.

<img data-src="/img/tut5/part16-albedo-color.jpg" class="center-image lazyload" alt="Base Albedo Color." title="At this stage, we should be able to see snow!">
*At this stage, we should be able to see snow!*

This leaves just the smoothness map. Yet again, use a `Sample Texture 2D` and a `Tiling And Offset` node with the `Base Smoothness Texture`, and connect that to a `Lerp` node. This time, we don’t really have any fancy calculations for the smoothness of the snowy areas – I’ve just set it to 0. The **T** value is the `Smoothstep` snow buildup value, just like it was for the `Base Color`. Then output that straight into the **Smoothness** on the master stack and we’re done with the shader!

<img data-src="/img/tut5/part16-bigimg.jpg" class="center-image lazyload" alt="Finished Shader." title="And I finished the look with a snowy particle system - how cosy!">
*And I finished the look with a snowy particle system - how cosy!*

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

# Conclusion

Ideally I’d have loved to do something more interesting with this shader, such as physically thickening the snow as it builds up instead of just using texturing tricks, but unfortunately we can’t yet use geometry shaders in Shader Graph and I think that’s the easiest way of pulling something like that off. However, we were able to make a convincing and customisable snow effect - you would be able to animate this over time so that it looks like snow clumps are forming in realtime!

The next big shader video will be the winner of February’s Patreon-exclusive poll: a look at *The Legend of Zelda: Breath of the Wild*’s grass in the form of a geometry shader, which means we’ll be using shader code instead of Shader Graph. The grass in that game looks gorgeous and I’m really looking forward to making this effect!

<hr/>

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers for March 2021!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

JP $$\cdot$$ Pablo Ruiz<br/>

Jack Dixon $$\cdot$$ Paul Froggatt $$\cdot$$ Tuomas Männistö $$\cdot$$ Sébastien Perouffe<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Jesper Kuutti $$\cdot$$ MR MD HARDING $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ Christopher Pereira $$\cdot$$ Harshad $$\cdot$$ James Poole $$\cdot$$ sadizeng $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Dan Violet Sagmiller $$\cdot$$ Be-Rad $$\cdot$$ Hung Hoang $$\cdot$$ Arthur H $$\cdot$$ Megan Taylor $$\cdot$$ Takuya $$\cdot$$ "Somebody"
</p>

<hr/>
