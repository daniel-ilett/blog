---
layout: post
title: How To Use Every Node in Unity Shader Graph
subtitle: 
bigimg: /img/every-node/bigimg.jpg
hdrimg: /img/every-node/banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, every-node, shader-graph]
nice-slug: Every Shader Graph Node
date: 2021-05-01
idnum: 80

part-label: 1
series-name: Deep Dives
---

Shader Graph ships with a lot of nodes. Over 200, as of Shader Graph 10.2! With such a vast array of features at your disposal, it's easy to get lost when you're searching for the perfect way to make the shader you have in mind. This tutorial shows you every single node in action, complete with examples, explanations of every input and output, and even best practices for certain nodes!

{: .box-note}
Health warning: you don't have to read this all at once! Jump back in at your own leisure to check what a few nodes do if you need a refresher. A little bit of shader background is required, as some terms and concepts are only briefly explained.

By the way, I have a [Discord server](https://discord.gg/tPQEUwPpb3) for people who are making things using shaders! If you want to share something you've worked on, see what others are doing, ask questions about shaders or otherwise just wanna hang out with others who like shaders, come join us!

Hop onto my [Discord server](https://discord.gg/tPQEUwPpb3) for people who love shaders! Patreon supporters get a bonus ✨ Member ✨ role. Ooohhh fancy!

Also check out this mammoth tutorial on YouTube. A like or comment would genuinely be amazing!

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/84A1FcQt9v4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

# What is Shader Graph?

Let's start with a quick run-down of what Shader Graph is and why it exists. Shaders are mini programs that run on the GPU, and they do things like texture mapping, lighting or colouring your objects in fancy ways, but you probably already know that if you clicked on this article. Traditionally, shaders have existed solely in code, but that's not very approachable or accessible for artists who don't code. Enter Shader Graph: an alternative to code shaders which uses **nodes** representing different functions which users can plug into each other on a visual and interactive **graph**. I like to think of them as code's fun cousin.

*You VS. the guy she tells you not to worry about.*

I won't cover the nodes that are contained in the **High Definition Render Pipeline** package - I'll only be covering those contained within the base Shader Graph package. I'll also cover a bit of prerequisite knowledge before we dive into shaders!

<hr/>

# Spaces

It's best if we briefly talk about spaces before talking about nodes. Many nodes expect their inputs or outputs to be in a specific space, which is sort of a way of representing a position or direction vector. Here's the spaces commonly seen in Shader Graph.

## Object Space

In **object space**, the position of all vertices of a model are relative to a centre point or pivot point of the object.

<img data-src="/img/every-node/0-object-space.png" class="center-image lazyload" alt="Object Space." title=".">

## World Space

In **world space**, we can have several objects, and now the positions of the vertices of every model are relative to a world origin point. In the Unity Editor, when you modify the position of any Transform, you are modifying the world space of an object.

## Absolute World Space vs World Space

Here's where render pipelines muddy the water a bit. In both URP and HDRP, **absolute world space** always uses the description I just used for world space. In URP, this definition is also used for **world space**. But HDRP uses **camera-relative rendering**, where the positions of objects in the scene become relative to the camera position (but not its rotation); **world space** in HDRP is camera-relative, whereas **absolute world space** is not.

<img data-src="/img/every-node/0-world-space.png" class="center-image lazyload" alt="World Space." title=".">

## Tangent Space

In **tangent space**, positions and directions are relative to an individual vertex and its normal. 

<img data-src="/img/every-node/0-tangent-space.png" class="center-image lazyload" alt="Tangent Space." title=".">

## View/Eye Space

In **view/eye space**, objects are relative to the camera and its forward-facing direction. This differs from **camera-relative rendering** because the rotation of the camera is taken into account.

<img data-src="/img/every-node/0-view-space.png" class="center-image lazyload" alt="View Space." title=".">

## Clip space

In **clip space**, objects are now relative to the screen. This space exists after view space has been projected, which depends on the camera field-of-view and clipping planes, and usually, objects outside of the clip space bounds get clipped (also called culled, but it basically means 'deleted'), hence the name.

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

# Block Nodes

All graphs end with the **block nodes**, which are found in the **Master Stack**. These are the outputs of the shader, and you must plug the outputs of other nodes into these special blocks in order for the shader to do anything. If you're using a version of Shader Graph prior to Version 9.0, you'll be using **Master Nodes** instead - they're basically the same thing, but less modular, so this section still largely applies. Some nodes only work on the **vertex stage** or **fragment stage** of your shader, which I'll make clear where relevant. Let's start with the **vertex stage blocks**.

## Vertex Stage Blocks

For the vertex stage, the shader takes every vertex on a mesh and moves them into the correct position on-screen. We can toy with the vertices to move them around or change the way lighting will interact with them. Each of the following blocks expects an input in **object space**.

### Position (Block)

The `Position` block defines the position of each vertex on a mesh. If left unchanged, each vertex position will be the same as they do in your modelling program, but we can modify this Vector3 to physically change the location of vertices in the world. You can use this for any effect which requires physically moving the mesh, such as ocean waves, but unfortunately, we can't modify positions of individual pixels/fragments, only vertices.

### Normal (Block)

The `Normal` block defines the direction the vertex normal points in. This direction is key to many lighting calculations, so changing this may change the way lighting interacts with the object. We can change this per-pixel in the fragment stage with another block node, unlike the `Position`.

### Tangent (Block)

The tangent vector lies perpendicular to the vertex normal, and for a flat surface, it usually rests on the surface of the object. We can modify the `Tangent` block to change the tangent vector - I recommend you change this if you change the vertex normal so that it is still perpendicular.

## Fragment Stage Blocks

Once the vertex stage has finished translating the vertices to their new positions, the screen is **rasterized** and turned into an array of **fragments** - usually, each fragment is one pixel, although in certain circumstances, they can be sub-pixel sized. For simplicity, we'll assume fragments and pixels are interchangeable from now on. The fragment stage blocks operate on each pixel.

### Base Color (Block)

This was called `Albedo` in some versions of Shader Graph. The `Base Color` would be the color of the object if all lighting, transparency and other effects were taken out of the equation.

### Normal (Tangent/Object/World) (Block)

As we saw, the vertex stage has its own normal block - we can access that normal, make further modifications per-pixel, and return a new normal vector for Unity's built-in lighting calculations. There are three blocks called `Normal`, which is a bit confusing, but each one just expects a normal vector in a different space - tangent, object or world. Only one can be active at a time - select the one you want in the **Graph Settings** using the **Fragment Normal Space** option.

### Emission

### Metallic

### Specular

### Smoothness

### Ambient Occlusion

### Alpha

### Alpha Clip Threshold

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
