---
layout: post
title: Ultra Effects | Part 7 - Vintage Video
subtitle: Scanlines and visual artefacts
bigimg: /img/tut3/part7-bigimg.jpg
hdrimg: /img/tut3/part7-banner.jpg
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, vhs, scanlines]
nice-slug: Vintage Video
date: 2020-02-12
idnum: 37

part-label: 7
series-name: Ultra Effects
---

Welcome back to the world of image effect shaders! In gaming today, nostalgia reigns supreme - not only are old games frequently remastered for modern hardware, but new properties pop up occasionally with an aesthetic based entirely on tech from the past. Those who grew up in the 80s and 90s probably watched films at home using **VHS tapes** and will surely remember the graphical artefacts those tapes suffered from.

On top of that, VHS tapes were predominantly viewed on **CRT TVs**. We've discussed [CRT screens](https://danielilett.com/2019-05-15-tut1-5-smo-retro/) on here before - one of the characteristic features of a CRT is the presence of **scanlines**. Today we're going to create an effect that brings together both of these ancient technologies.

<img data-src="/img/tut3/part7-vhs-tape.jpg" class="center-image lazyload" alt="VHS Tape">

[Image by Joshua_Willson from Pixabay]("https://pixabay.com/users/Joshua_Willson-876211/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1322179")

<hr/>

# Scanlines

CRT screens typically produce images in rows. Each row is filled in horizontally, left-to-right, and once a row is filled, the following row is filled. Each row is called a **scanline**. But when we talk about scanlines colloquially, you're probably thinking of the dark lines that appear over the image - these are actually gaps between the real scanlines. We're skipping over a lot of technical detail - not all CRTs had visible scanlines due to the arrangement of pixels - but as is now tradition with this series, we're more interested in people's *expectations* of what a scanline should look like when building the effect. We're going to overlay our source image with slightly darker lines. We'll have two modes in mind - relatively thick scanlines which will look best when faded, and thinner scanlines which will look better when dark. Inside the *Textures* folder are our two textures - *Scanlines.png* and *Scanlines2.png* - each of which has a resolution of only 4x4.

<img data-src="/img/tut3/part7-scanline-textures.jpg" class="center-image lazyload" alt="Scanline Textures">

Let's jump into the Scanline shader, found at `Resources/Shaders/Scanlines.shader`. Since it's so basic, it's the perfect shader to warm ourselves up since the previous Ultra Effects article!

We're going to need four variables: `_MainTex` is the base image texture captured by the camera; `_ScanlineTex` is one of the two scanline textures above, or you can supply your own; `_Strength` controls how dark the scanlines will appear; and `_Size` controls how large the scanlines are. Put these declarations above the fragment shader.

~~~glsl
sampler2D _MainTex;
sampler2D _ScanlineTex;
float _Strength;
int _Size;
~~~

Now we're going to overlay `_ScanlineTex` on top of `_MainTex`. It's best to make sure any scanline texture you choose to use has its filter mode set to point filtering so that your scanlines look crisp. And you'll certainly want to set its wrap mode to repeat, because this tiny texture is going to be tiled many times across the screen.

We're going to multiply the UV coordinates used to sample _ScanlineTex by using _Size as a multiplier inside the fragment shader.

~~~glsl
float4 frag (v2f i) : SV_Target
{
    float2 scanlineUV = i.uv * (_ScreenParams.y / _Size);

    ...
}
~~~

Here, `_ScreenParams.y` contains the y-resolution of the screen texture, `_MainTex`. You could scale the UVs by `_ScreenParams.xy` to include scaling along the x-axis, but since our scanlines are purely horizontal, it's not necessary. The original UVs contained in `i.uv` are normalised between 0 and 1, so multiplying by `_ScreenParams.y` and dividing by `_Size` will tile the texture exactly `_Size` times along the y-axis.

Next, we will sample the original image texture and the scanline texture using `i.uv` and `scanlineUV` respectively.

~~~glsl
float4 col = tex2D(_MainTex, i.uv);
float4 scanlines = tex2D(_ScanlineTex, scanlineUV);
~~~

Now we need to combine the two image samples. We could multiply the two images together - this would result in totally black lines between intact rows of the original image, but we want to control the `_Strength` of the effect. Instead, we'll `lerp` between the original image - `col` - and the modified image - `col * scanlines` - using `_Strength` as the interpolation factor.

~~~glsl
return lerp(col, col * scanlines, _Strength);
~~~

Now we must create a script called `ScanlinesEffect` to drive the effect. It's super simple so we won't go too in-depth, but take the time to re-familiarise yourself with the script format if you need to. It's at *Scripts/ScanlinesEffect.cs*. Its only function is to pass variables to the shader and perform a basic `Graphics.Blit` each frame.

~~~csharp
[SerializeField]
private Texture2D scanlineTex = null;

[SerializeField]
private float strength = 0.1f;

[SerializeField]
private int size = 8;

// Find the Scanlines shader source.
public override void OnCreate()
{
    if(scanlineTex == null)
    {
        scanlineTex = Texture2D.whiteTexture;
    }

    baseMaterial = new Material(Resources.Load<Shader>("Shaders/Scanlines"));
    baseMaterial.SetTexture("_ScanlineTex", scanlineTex);
    baseMaterial.SetFloat("_Strength", strength);
    baseMaterial.SetInt("_Size", size);
}

public override void Render(RenderTexture src, RenderTexture dst)
{
    Graphics.Blit(src, dst, baseMaterial);
}
~~~

When we run the scene with this effect activated (the effect can be found at *Effects/Scanlines*) using the thin scanline texture variant and a medium strength of around 0.4, the result looks like this:

<img data-src="/img/tut3/part7-scanlines.jpg" class="center-image lazyload" alt="Scanline Effect">

<hr/>

# Visual Glitches

VHS tapes were known for their visual artefacts. Depending on how old the tape is, how it has been stored and whether it was copied from another tape, all kinds of oddities, from noise and distortion to missing or fuzzy bands across the image, plagued VHS. We've covered noise in a previous tutorial, and today we're going to leverage what we learned to add a fuzzy band of **interference** over our image. To render a fuzzy band, we'll use a thin, long **gradient texture** to control the 'shape' of the band (or, if you'd like, the number of bands that appear - the example will stick to one band). Then, we'll modulate the UVs used to read the texture over time so that the band appears to scroll down the image, as it might in a real VHS tape, and add a noise offset to the UVs so the band is a bit fuzzy.

Let's kick off with *Resources/Shaders/Interference.shader*. We're going to copy the **Perlin noise** code we used back in the [film grain article](https://danielilett.com/2019-11-20-tut3-5-filmic-filters/) inside a `CGINCLUDE` block above the shader `Pass` - remember that the `perlin2D` function collapses a `float2` vector into a single pseudorandom value.

Let's think about the variables we'll need for the effect. We're going to need to pass in the **gradient texture**, which we'll call `_InterferenceTex`, and a `float` to control the `_Speed` of the effect.

~~~glsl
sampler2D _MainTex;
sampler2D _InterferenceTex;
float _Speed;
~~~

Next, we'll calculate the UVs for sampling the interference texture. We're going to modulate this by time and noise - we'll calculate the noise first.

~~~glsl
float4 frag (v2f i) : SV_Target
{
    float2 pos = i.uv * _ScreenParams.xy / 4.0f;
    float2 offset = float2(perlin2D(pos), perlin2D(pos + 0.5f));

    ...
}
~~~

Using the `_ScreenParams` like we did for the scanline effect, but this time using both the `x` and `y` components, we'll convert from UV coordinates to what I like to call 'pixel coordinates', then divide by 4. This value will be the seed for our `perlin2D` random number generator. Dividing by 4 means that the fuzz will have a lower resolution - it's a magic number that you can change if you want. We'll then calculate the noise-based `offset` using the `perlin2D` function on the position. We add 0.5 to the y-component seed for a bit of variation to the offset.

~~~glsl
float2 interferenceUV = i.uv + offset * 0.05f + _Time.yy * _Speed;
float interference = tex2D(_InterferenceTex, interferenceUV);
~~~

To add the time-based offset, we'll add an extra offset based on `_Time.y` (which represents unscaled time, as opposed to `_Time.x` which is slowed down), multiplied by the effect's `_Speed`. Here, we also add the interference `offset`, multiplied by another magic number - 0.05 - so its effect isn't too great. Using those UVs, we sample the interference gradient texture.

~~~glsl
float4 col = tex2D(_MainTex, i.uv);
				
return lerp(col, 1.0f, interference);
~~~

All that's left to do is sample the main texture and add fuzziness where necessary. To add the fuzziness, we `lerp` between the main texture sample and full-white, where the value of the interference texture sample is the interpolation factor.

Let's gloss over the script to control this effect. It's more basic than even the scanline effect script, as it has fewer variables. Open *Scripts/InterferenceEffect.cs* to see. As with `ScanlineEffect`, `InterferenceEffect`'s job is to `Blit` the screen each frame and pass variables over to the shader.

~~~csharp
[SerializeField]
private Texture2D interferenceTex = null;

[SerializeField]
private float speed = 0.5f;

// Find the Interference shader source.
public override void OnCreate()
{
    if (interferenceTex == null)
    {
        interferenceTex = Texture2D.whiteTexture;
    }

    baseMaterial = new Material(Resources.Load<Shader>("Shaders/Interference"));
    baseMaterial.SetTexture("_InterferenceTex", interferenceTex);
    baseMaterial.SetFloat("_Speed", speed);
}

public override void Render(RenderTexture src, RenderTexture dst)
{
    Graphics.Blit(src, dst, baseMaterial);
}
~~~

And with that out of the way, we can see what the effect looks like when applied to the scene - the effect can be found at *Effects/Interference*:

<img data-src="/img/tut3/part7-fuzzy-band.jpg" class="center-image lazyload" alt="Interference Band">

Combining the scanline and interference effects, as well as adding noise to the full image, we can create a basic CRT effect - this project contains a composite effect in *Effects/CRT*:



# Conclusion

We've taken a lot of inspiration from retro effects during this series, and this article is no exception - CRT screens and VHS tapes are hugely nostalgic for millenials in particular. CRT screens have many characteristic features, one of which is the presence of visible scanlines not present on modern LCD or LED screens. VHS tapes are often remembered for their poor quality artefacts compared to DVDs, including bands of fuzzy or missing information across the screen.

Next time, we'll look at a kaleidoscope effect in which we mirror an image, or parts of it, several times at certain angles.

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
- Shaun Wall
- Chris Sims
- Christopher Pereira
- JacksonG
- Pat

And a shout-out to my top Ko-fi supporters:

- Hung Hoang
- Mysterious Anonymous Person

<hr/>
