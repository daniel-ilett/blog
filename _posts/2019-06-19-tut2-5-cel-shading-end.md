---
layout: post
title: Cel Shading | Part 5 - Finishing Touches
subtitle: Going over any unexplored concepts
bigimg: /img/tut2/part5-banner.jpg
gh-repo: daniel-ilett/cel-shading
gh-badge: [star, fork, follow]
tags: [shaders, unity, lighting, cel-shading, outro]
nice-slug: Finishing Touches
date: 2019-06-23
idnum: 17

part-label: 5
series-name: Cel-shading
---

Last time we looked at stencil-based outlines, and today we're going to explore the quirks of the stencil buffer to fix a couple things in our cel-shading effect. We'll also look at once alternative way of providing diffuse lighting to our material, which becomes especially useful if you desire more than one cut in your lighting levels.

<hr/>

# Stencil IDs

Let's revisit our stencil buffer-based outline implementation. We used a reference value of 1 - an arbitrary value I picked for demonstration - for the previous shader, `OutlineCelShaded`. What happens when you overlap two objects using the same stencil reference value?

<img data-src="/img/tut2/part5-stencil-overlap.jpg" class="center-image lazyload" alt="Stencil Overlap">

Looks a bit weird, doesn't it? When we use a stencil buffer in this way, both Ethan's arm and the cube behind him are writing the same value to the buffer - so when the outline pass is performed for Ethan, we aren't able to draw his hand's outline because the pixels of the image where his outline would go will fail the stencil check. The stencil for those pixels were written by the cube's first pass. This might seem annoying, and it is - but it's also useful! You might already have noticed in the previous tutorial that Ethan's body and glasses are both covered by the same outline, as if they were one contiguous object, but this isn't the case - they're separate meshes. By using the same reference values, even on separate materials, we can make it look like multiple meshes are one object; this would be useful if you'd like to make, say, a complex multi-mesh terrain look like a single mesh.

<img data-src="/img/tut2/part4-ethan-complete.jpg" class="center-image lazyload" alt="Ethan's Glasses">

Let's say we want to use several different reference values for different meshes. Right now, we've hardcoded the reference value into the shader, but we won't have to write a new shader file for every value we want to use - we can set this in `Properties` very easily. Open `FinalCelShaded.shader`, which based upon the outline shader from the previous tutorial, and add an `ID` property.

~~~glsl
// In Properties.
_ID("Stencil ID", Int) = 1
~~~

This sets an integer property on the material inspector with a default value of 1. Because we won't be using it inside `CGPROGRAM` block, we don't have to declare it inside the shader code a second time alongside the other variables. Let's use that value in the stencils now - take care to modify the reference value for both shader passes or your stencils won't match up!

~~~glsl
// Inside BOTH Stencil blocks.
Ref[_ID]
~~~

We've replaced the `Ref 1` lines and linked the `_ID` property to the stencils. Now, by creating two materials - one for Ethan and one for the cube behind him - we can set different IDs to each and fix the problem of stencil overlapping.

<img data-src="/img/tut2/part5-stencil-fixed.jpg" class="center-image lazyload" alt="Stencil Fixed">

This gives us a lot more control of how outlines appear on objects. I'd recommend taking a Borderlands style approach for this - bold outlines over the edge of the object as a whole, setting individual meshes to have the same ID values, while baking finer outline details into individual textures for performance.

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

# Lighting Texture Ramp

Our implementation of the lighting ramp so far introduces a single cut in the diffuse lighting. Sometimes, we would prefer several cuts, which might be more difficult to do with a pure shader application - we'd need to pass in a bunch of new properties to determine where they should go. Instead, the approach we'll take is to use a texture to encode the lighting we prefer. This is a little expensive because of the added texture lookup but adds a layer of flexibility that's hard to represent in pure code.

Let's return to our shader. In our previous iterations, we calculated a `diffuse` value using the dot product, then smoothed the result using `fwidth` and `smoothstep`. Now, we'll be using the `diffuse` value to read from a texture. Essentially, we provide a texture representing a mapping between the minimum and maximum lighting values, with the left-hand side of the image representing the minimum lighting and the right-hand side representing maximum lighting. We could even introduce colour into the lighting ramp if we wished, but we're already including the object albedo, directional lighting and ambient sky lighting colours in our calculations.

<img data-src="/img/tut2/part5-lighting-ramp-src.jpg" class="center-image lazyload" alt="Lighting Ramp Texture">

First, we'll include the new texture in the `Properties` block and our variable declarations.

~~~glsl
// In Properties.
_LightingRamp("Lighting Ramp", 2D) = "white" {}

// Alongside variable declarations.
sampler2D _LightingRamp;
~~~

Let's replace the two lines of calculation of `delta` and `diffuseSmooth`. We'll set the UVs used to sample the texture based on the value of `diffuse`, which ranges between -1 and 1. We're sampling along the u-axis between 0 and 1, and will pick a constant of 0.5 for our v-axis value, because out information is only encoded horizontally.

~~~glsl
// Replace these lines:
//float delta = fwidth(diffuse) * _Antialiasing;
//float diffuseSmooth = smoothstep(0, delta, diffuse);

// With this line:
float3 diffuseSmooth = tex2D(_LightingRamp, float2(diffuse * 0.5 + 0.5, 0.5));
~~~

That's all we need to do inside the shader. The other key thing is to set the Wrap Mode of the ramp texture in the Inspector importer to 'Clamp', else you'll encounter strange artefacts on the model where the `diffuse` dot product equals -1 or 1.

<img data-src="/img/tut2/part5-lighting-ramp.jpg" class="center-image lazyload" alt="Lighting Ramp">

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

That wraps up the Cel Shading series! We've learned a lot about lighting models, starting with the Phong shading model and building our way up to stylised, cartoonish effect. We've explored the calculations integral to lighting and the power of Unity surface shaders to drive those calculations. Finally, we took a quick look at stencil shaders and how we can use them to give objects bold, striking outlines to emphasise objects.

This blog will take a short break and will return very soon with a brand-new series on Portals! Rendering, physics, lots of weird maths - it's gonna be quite in-depth and I'm very much looking forward to it!

<hr/>
