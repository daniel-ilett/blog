---
layout: post
title: Stylised Water in Shader Graph and URP
subtitle: Flaunting a fast fluid simulation technique
bigimg: /img/tut5/part3-bigimg.jpg
hdrimg: /img/tut5/part3-banner.jpg
gh-repo: daniel-ilett/water-urp
gh-badge: [star, fork, follow]
tags: [unity, shaders, water, urp, shader-graph]
nice-slug: URP Metaballs
date: 2020-04-05
idnum: 44

part-label: 3
series-name: URP
---

Stylised water is the rite of passage for every shader creator on the Internet. Although there's already a deluge of water effects out there, URP is still relatively new so one more won't be flooding the market. Today I want to recreate the water from *The Legend of Zelda: The Wind Waker* - it has a very distinctive, stylised appearence which we should be able to reconstruct in Shader Graph and Universal RP. Let's dive right in!

<img data-src="/img/tut5/part3-zelda-screenshot.jpg" class="center-image lazyload" alt="The Wind Waker">
*The Legend of Zelda series is keeping me in business.*

# Stylised Water

The Great Sea is made up of a great expanse of blue, broken up by rings of foam, as you can see in the above screenshot from the game. In some sections, the's a similar but darker ring pattern that shows up underneath the foam - we'll include them both in our effect. Because it's an ocean, there's sections where the waves are a bit choppier, so we'll need to wiggle the foam textures around a bit and physically move the water's surface geometry up and down in a wave pattern. Finally, when an object intersects the surface of the water, we'll draw a bit more foam around the intersection point.

{: .box-note}
[Download the GitHub repository](https://github.com/daniel-ilett/water-urp) for this project if you're following along at home!

We'll be using Shader Graph for this project. The graph can be found in the **Assets** folder under *Shaders/StylisedWater.shadergraph*. We'll go through each section of the graph in order, starting with the flow map. The foamy surface of the water needs to be animated slightly to look as if the water has motion - if we kept a static texture, then even once we've added waves via vertex displacement (that's much later on in this article!) then the foam will look a bit rigid. To animate the foam, we'll distort the UV coordinates used to sample the foam texture according to a 'flow map'. This flow map contains normal data arranged in such a way that each pixel normal describes which direction a fluid will flow toward, and we can use those normal vectors to offset the UVs we use to sample the foam texture. In fact, this process will look familiar if you read by [underwater post process effect article](https://danielilett.com/2019-10-22-tut3-2-sinking-feeling/) - we'll even use the same flow map.

For the flow map, we'll need to animate it over time. We also want to be able to control the flow speed and flow texture/map in the material Inspector as well as the flow strength, and while we're there we'll add a size property - we'll need it when we sample the foam texture, but while testing things out I discovered that as size increases, it looks better if the flow amount decreases. Both can be tweaked in the material Inspector anyway.

<img data-src="/img/tut5/part3-flow-map-properties.jpg" class="center-image lazyload" alt="Flow Map Properties">
*These are the properties we'll use for the flow map.*

Let's start easy and just poll the flow map texture using a `Normal From Texture` node, then `Multiply` its output by the `Flow Strength` property.

<img data-src="/img/tut5/part3-polling-normals.jpg" class="center-image lazyload" alt="Polling normals">
*`Normal From Texture` removes the need for a separate `Sample Texture 2D` node.*

Then, we'll modulate the UVs on the `Normal From Texture` node over time. Start by creating a `Divide` node to divide the `Flow Speed` property by the `Size` property. As I mentioned, this prevents large patches of water flowing strangely. Then, `Multiply` the output by a `Time` node using its regular **Time** output. This will allow the normals to scroll over time. You'll need to `Add` this value to a `UV` node, keeping the drop-down value at **UV0**. The final output of the `Add` node gets funneled into the **UV** input of `Normal From Texture`.

<img data-src="/img/tut5/part3-modulate-uvs-over-time.jpg" class="center-image lazyload" alt="Polling normals">
*We can modulate the UVs over time and with varying speed and strength.*

Everything we've created so far can be bundled into a group called "Distort UVs based on Flow Map".

Now we'll sample the foam texture. The water in *The Wind Waker* has loads of blotchy patches of foam - at first I thought of using Unity's built-in `Voronoi` node to generate a randomised grid of blotches, but I settled on the far easier method of using a voronoi texture. I found a good one online and modified it so that the grid lines of each cell are white and the background is black, then I made a variant with slightly curved lines and a couple of smaller cells. It's up to you which one you use - both are in the *Textures* folder.

<img data-src="/img/tut5/part3-voronoi-textures.jpg" class="center-image lazyload" alt="Voronoi Textures">
*There are two variants of the voronoi foam texture depending on your preference.*

<hr/>

# Conclusion

<hr/>

# Acknowledgements

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early!

Special thanks to my Patreon backers:

- Gemma Louise Ilett
- Jack Dixon
- John Selig
- Chris Sims
- FonzoUA
- Jason Swearingen
- Shaun Wall
- Christopher Pereira
- Patrick A Farnach
- Zachary Alstadt

And a shout-out to my top Ko-fi supporters:

- Hung Hoang
- Mysterious Anonymous Person

<hr/>
