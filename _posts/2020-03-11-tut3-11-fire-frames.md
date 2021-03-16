---
layout: post
title: Ultra Effects | Part 11 - Fire Frames
subtitle: A burning ring of fire
bigimg: /img/tut3/part11-bigimg.jpg
hdrimg: /img/tut3/part11-banner.jpg
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, fire]
nice-slug: Fire Frames
date: 2020-03-11
idnum: 41

part-label: 11
series-name: Ultra Effects
---

Fire. Its discovery was one of the first major milestones in humanity's long history. And, as it turns out, it looks nice when you want your game screen to look like it's burning from the edges inwards. Today, we'll be dancing with fire... *in shaders*!

<img data-src="/img/tut3/part11-fire-example.jpg" class="center-image lazyload" alt="Paper on fire">

[Image by Alicja from Pixabay](https://pixabay.com/photos/the-flame-fire-burn-glow-paper-3340762/)

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

# Fire Shader

The effect we'll build will make our scene look as if it's printed on a piece of paper that's burning from the edges inwards. There are a lot more moving parts than you'd expect, and a lot more design decisions - what happens to pixels where the image has been 'burnt' completely? Should the fire be animated? What colours should the edges of the fire be? We'll make as many of those decisions flexible as possible.

Let's jump into the shader code. Open *Resources/Shaders/Fire.shader*. To start off with, let's add all the textures we'll use. We need `_MainTex` as usual. Then, we'll use a noise texture, `_DissolveNoise`, to denote which portions of the image should be on fire. We'll use a texture called `_ColorRamp` to tint the edges of the 'fire front', and a separate texture called `_AlphaRamp` to determine which areas of the image are fully burnt - those sections will be 'transparent'. Finally, in order to animate the flames, we'll use a normal texture called `_FlowMap`.

~~~glsl
sampler2D _MainTex;
sampler2D _DissolveNoise;
sampler2D _ColorRamp;
sampler2D _AlphaRamp;
sampler2D _FlowMap;
~~~

To control how these textures interact, we'll also need to add a few other variables. `_Size` will control how far the fire effect travels from the edges of the texture, `_Strength` influences how strongly the flames animate, and `_Tiling` will control how finely detailed the noise texture is. To control which direction the flame flicker animates in, we'll add a `_FlickerDir` vector, and finally, to control the background colour of the image - which will appear where all parts of the image have been fully 'burnt' - we'll add a final variable called `_BackgroundColor`.

~~~glsl
float _Size;
float _Strength;
float _Tiling;
float2 _FlickerDir;
float4 _BackgroundColor;
~~~

Now we can work on the fragment shader. We'll sample the main texture first.

~~~glsl
float4 col = tex2D(_MainTex, i.uv);
~~~

Then, we'll extract a direction vector from the `_FlowMap` we passed into the shader. We did this for the [Underwater](https://danielilett.com/2019-10-22-tut3-2-sinking-feeling/) effect earlier in this series. `_FlowMap` contains normal vector data, which we can extract using Unity's built-in `UnpackNormal` function, and since we'll be using these normals to animate the flames over time, we'll calculate an offset value, `flickerOffset`, based on `_Time` and `_FlickerDir`, then add that to the UVs used to sample the texture.

~~~glsl
float2 flickerOffset = _Time.x * _FlickerDir;
half3 normal = UnpackNormal(tex2D(_FlowMap, (i.uv + flickerOffset) % 1.0));
float2 uvOffset = normal * _Strength;
~~~

Now we can use the offset to sample the main noise texture. This will form the basis of the dissolve effect. To avoid visible tiling of the noise texture and make the effect a bit more varied, we'll repeat the trick we made in the [previous tutorial](https://danielilett.com/2020-03-04-tut3-10-dungeon-drawing/) where we sampled the texture a second time at a higher resolution and took the average of both. We'll only add the `uvOffset` and `flickerOffset` to the high-resolution sample - we're adding *both* for even more variation!

~~~glsl
float2 dissolveUV = i.uv * _Tiling;
float dissolveBase = (tex2D(_DissolveNoise, dissolveUV) + 
    tex2D(_DissolveNoise, dissolveUV * 3.0f + uvOffset + flickerOffset)) / 2.0f;
~~~

Next, we'll need to find out how far the pixel is from the edge of the screen - if the pixel is near the middle, we won't want it to be affected by the flames. We can use the UV position and a bit of Pythagoras to get the distance of the pixel from the centre of the screen.

~~~glsl
float2 distance = (i.uv - 0.5f) * 2.0f;
float dissolveDist = sqrt(distance.x*distance.x + distance.y*distance.y);
~~~

Now, we can calculate a final `dissolve` value to denote how 'burnt' the pixel should be. We'll use that value to sample `_ColorRamp` and `_AlphaRamp` - the colour and transparency textures.

~~~glsl
float dissolve = (dissolveBase + _Size) * dissolveDist;

float4 dissolveColor = tex2D(_ColorRamp, float2(dissolve, 0.5f));
float dissolveAlpha = tex2D(_AlphaRamp, float2(dissolve, 0.5f)).a;
~~~

And finally, we'll use both of those ramp textures. The colour ramp is going to be used to denote what colour the edges of the parts of the screen engulfed in flames will be. We'll use the alpha/transparency channel of `dissolveColor` to determine at which point we stop using the original texture colours and start using the flame colours. Since we're using `_ColorRamp`'s alpha channel for this purpose, we use a separate texture, `_AlphaRamp`, to determine the point where we start drawing `_BackgroundColor`. For both these use cases, we'll use the `lerp` function. For colour drawing, we'll use `dissolveColor.a` as the interpolation factor, and for the background cut-off, we'll use `dissolveAlpha` as the interpolation factor.

~~~glsl
col = lerp(col, dissolveColor, dissolveColor.a);
col = lerp(_BackgroundColor, col, dissolveAlpha);

return col;
~~~

That's it for the shader! Now, we can write a script to drive the effect. Open *Scripts/Image Effects/Fire.cs*. We'll kick off with all the variables we need for the effect.

~~~csharp
[SerializeField]
private Texture2D dissolveNoise;

[SerializeField]
private Texture2D colorRamp;

[SerializeField]
private Texture2D alphaRamp;

[SerializeField]
private Texture2D flowMap;

[SerializeField]
private float size = 1.0f;

[SerializeField]
private float strength = 0.5f;

[SerializeField]
private float tiling = 1.0f;

[SerializeField]
private Vector2 flickerDir = Vector2.zero;

[SerializeField]
private Color backgroundColour = Color.black;
~~~

These variables correspond to those we declared in the shader. Then, all that's left to do is pass the data to the shader in `Render`.

~~~csharp
baseMaterial.SetTexture("_DissolveNoise", dissolveNoise);
baseMaterial.SetTexture("_ColorRamp", colorRamp);
baseMaterial.SetTexture("_AlphaRamp", alphaRamp);
baseMaterial.SetTexture("_FlowMap", flowMap);
baseMaterial.SetFloat("_Size", size);
baseMaterial.SetFloat("_Strength", strength);
baseMaterial.SetFloat("_Tiling", tiling);
baseMaterial.SetVector("_FlickerDir", flickerDir);
baseMaterial.SetColor("_BackgroundColor", backgroundColour);
~~~

And that's the script finished! Let's see what the effect looks like in action. 

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut3/part11-fire-effect.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

In *Effects/Fire.asset*, we've created a fire effect which uses two ramps included in the Textures folder - *FireColorRamp.png* and *FireAlphaRamp.png*. We've set the size to 0.75 and the strength to a low value of 0.01, the tiling is at the default value of 1, and the flicker direction is pointing roughly in the bottom-left corner (the movement direction of the flames acts in the opposite direction to these values because we're adding these values to the UV coordinates used to sample a texture). Finally, the background colour is set to black. Tweak these values to your heart's content!

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

We've put together a highly customisable fire effect using several textures working together. By separating out all the parts of the fire effect to their own textures and variables, you can change the look and feel of the effect drastically by changing only one value or swapping out a single texture. 

<hr/>

# Acknowledgements

### Assets

This tutorial series uses the following asset packs:

[Forest - Low Poly Toon Battle Arena / Tower Defense Pack](https://assetstore.unity.com/packages/3d/environments/forest-low-poly-toon-battle-arena-tower-defense-pack-100080) | [**AurynSky**](https://assetstore.unity.com/publishers/17283)

### Supporters

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
- JacksonG
- Pat
- Zachary Alstadt

And a shout-out to my top Ko-fi supporters:

- Hung Hoang
- Mysterious Anonymous Person

<hr/>
