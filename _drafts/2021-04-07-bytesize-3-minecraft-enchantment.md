---
layout: post
title: "Bytesize Gamedev #3 - Minecraft Enchantment"
subtitle: 
bigimg: /img/bytesize/part3-bigimg.jpg
hdrimg: /img/bytesize/part3-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, bytesize, minecraft, enchantment]
nice-slug: Minecraft Enchantment
date: 2021-04-07
idnum: 65

part-label: 3
series-name: Bytesize Gamedev
---

*Minecraft* is still one of the biggest games in the world after about a decade, and one of my favourite visual effects from the game is the shine applied to enchanted gear. In this Bytesize Gamedev, we'll translate it to Shader Graph.

{: .box-note}
Bytesize Gamedev is a series of shorter game development tutorials.

Hang out with me and other shader enthusiasts over on [Discord]((https://discord.gg/tPQEUwPpb3)) and share what you're working on! And check out this tutorial over on YouTube:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/iRegHo8_GBk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

# Minecraft Enchantment

When you enchant items in *Minecraft*, it gains a purple glowing effect on top of whatever magical augmentations you chose. We can simulate the glow using a scrolling texture, and I got the best results by sliding two textures over the model in different directions. Today, we'll apply the effect to a *Minecraft* pickaxe using Shader Graph - let's jump into it.

We'll start with a Sub Graph. Since we're sampling the texture twice, we can bundle everything to do with the enchantment shine sampling into a Sub Graph so that our main graph is neater. Go to *Create -> Shader -> Sub Graph*, and name it `EnchantmentShine`. This Sub Graph will output a single `Color` called `OutColor`, which you can modify in the `Output Node`'s settings.

<img data-src="/img/bytesize/part3-sub-graph.png" class="center-image lazyload" alt="Sub Graph Creation." title="Your graph can have little a graph, as a treat.">
*Your graph can have little a graph, as a treat.*

For the Sub Graph, we'll add a couple of properties: a `Vector2` called `Scroll Speed` and a `Texture 2D` called `Enchantment Texture`. You can name them whatever you want, as long as it's descriptive.

<img data-src="/img/bytesize/part3-sub-graph-properties.png" class="center-image lazyload" alt="Sub Graph Properties." title="You can multi-select properties to see them all in Node Settings.">
*You can multi-select properties to see them all in Node Settings.*

Then we can sample `Enchantment Texture` with a `Sample Texture 2D` node. I multiply the **RGBA** and **Alpha** outputs since we will be using this color additively, then output it to the `Output Node`.

<img data-src="/img/bytesize/part3-sample-enchantment.png" class="center-image lazyload" alt="Sample Enchantment Texture." title="These nodes are very enchanting.">
*These nodes are very enchanting.*

To use the `Scroll Speed`, I'll take a `Tiling And Offset` node and output it to the `Sample Texture 2D`'s UV input - this is often the easiest way to modify UVs. Since the enchantment shine appears diagonally on objects in *Minecraft*, we'll stick a `Rotate` node in here to use as the base UVs for the `Tiling And Offset`. A **Rotation** of about 15 degrees with a **Center** of (0.5, 0.5) works well. For the **Offset**, I will use `Scroll Speed` multiplied by `Time`.

<img data-src="/img/bytesize/part3-sub-graph-uvs.png" class="center-image lazyload" alt="Sub Graph UVs." title="They see me scrollin'.">
*They see me scrollin'.*

Now we'll handle the main graph, which will be Lit/PBR, depending on your Unity version. Go to `Create -> Shader -> Universal Render Pipeline -> Lit Shader Graph` and name it `Enchantment`. 

<img data-src="/img/bytesize/part3-main-graph.png" class="center-image lazyload" alt="Main Graph Creation." title="This might be different on older versions - look out for PBR Graph if Lit isn't available.">
*This might be different on older versions - look out for PBR Graph if Lit isn't available.*

The first property here will be `Main Texture`, and I'll assign the pickaxe texture by default. Then we'll add an `Enchantment Texture`, the same as the Sub Graph, and assign the glow texture by default.

<img data-src="/img/bytesize/part3-main-graph-properties.png" class="center-image lazyload" alt="Main Graph Properties." title="We won't need Scroll Speed like the Sub Graph, because we'll be assigning values inside the main graph.">
*We won't need Scroll Speed like the Sub Graph, because we'll be assigning values inside the main graph.*

We'll sample the `Main Texture`, then add two `EnchantmentShine` nodes - that's the Sub Graph we made - using the `Enchantment Texture`. Give them **Scroll Speed** values of (-0.3, 0.6) and (-0.5, 1.3) - you can tweak these if you want. Multiply the second one by 0.25 because we want it to be fainter than the other, then add both together and add the result to the `Main Texture` sample.

<img data-src="/img/bytesize/part3-main-graph-nodes.png" class="center-image lazyload" alt="Main Graph Nodes." title="Using two offsets is usually a good approach for more variation.">
*Using two offsets is usually a good approach for more variation.*

Now we can start outputting things. The result of the final `Add` node will be used as the **Base Color**. Through experimentation, I found that it's best to then use the previous `Add` node for both **Emission** and **Metallic**, which gives the pickaxe a lovely glow.

<img data-src="/img/bytesize/part3-main-graph-output.png" class="center-image lazyload" alt="Main Graph Output." title="You can tweak these if you want - this looked best to me.">
*You can tweak these if you want - this looked best to me.*

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

#### Special thanks to my Patreon backers for May 2021!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

JP $$\cdot$$ Pablo Ruiz<br/>

Jack Dixon $$\cdot$$ Paul Froggatt $$\cdot$$ Tuomas Männistö $$\cdot$$ Sébastien Perouffe<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Josh Swanson $$\cdot$$ MR MD HARDING $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ Christopher Pereira $$\cdot$$ Harshad $$\cdot$$ James Poole $$\cdot$$ Lee Miller $$\cdot$$ Ming Lei $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Arthur H $$\cdot$$ Megan Taylor $$\cdot$$ Takuya $$\cdot$$ "Somebody"
</p>

<hr/>
