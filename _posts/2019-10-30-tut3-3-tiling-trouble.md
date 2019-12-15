---
layout: post
title: Ultra Effects | Part 3 - Tiling Trouble
subtitle: Pixelating and overlaying textures
bigimg: /img/tut3/part3-banner.jpg
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, tiling, textures]
nice-slug: Tiling Trouble
date: 2019-10-30
idnum: 26
---

Mosaics have their roots in ancient culture. Floor mosaics comprised of tiny squares of stone and glass were commonly used as decorative art in the ancient world and are still used as a form of artistic expression in modern times. Perhaps you could even argue that pixel art is a type of digital mosaic born out of technical limitations! That's not as silly a suggestion as you'd think - and we're going to prove it today by turning arbitrary images into mosaics by using **pixelation** together with a tiled **texture overlay**.

<img data-src="/img/tut3/part3-floor-mosaic.jpg" class="center-image lazyload" alt="Floor Mosaic">

[Photo found on Pixabay](https://pixabay.com/photos/mosaic-ruins-ephesus-ancient-roman-315841/)

<hr/>

# Little squares

Contemporary display technology already displays your image as a series of tiny squares - pixels. This would be a boring tutorial if we left it there, so we're going to let the user specify how many tiles should be visible on the screen and adjust the colour of the pixels within those tiles accordingly. There are several ways to do that - a shader could aggregate the colours within those tiles - but by far the easiest way to do this is outside of shaders: we'll use scripting to decrease the **resolution** of the texture while leaving it blocky.

However, mosaics aren't just made up of the tiles - there's space in between for whatever binding material holds those tiles together. For that, we'll overlay a texture on top of the pixelated image, tiled such that the pixelated image lines up with the overlay.

{: .box-note}
Please download the project repository from [GitHub](https://github.com/daniel-ilett/image-ultra) if you'd like to follow along!

<hr/>

# Pixelation

The first step is to reduce the resolution of the image. As we've discussed, we could do it within a shader - but it's far easier to do this outside of the shader. To start off, we'll look at `MosaicEffect.cs`, found at `Scripts/Image Effects/MosaicEffect.cs`. Let's introduce a member variable to start off with, the one that controls how many tiles to use: `xTileCount`.

~~~csharp
[SerializeField]
private int xTileCount = 100;
~~~

We only need to know the number of tiles in the x-direction, since we can calculate the number in the y-direction using the **aspect ratio** of the screen. We'll take a closer look at the `OnCreate` function soon enough, but first we shall look at `Render`.

~~~csharp
public override void Render(RenderTexture src, RenderTexture dst)
{
    RenderTexture tmp = 
        RenderTexture.GetTemporary(xTileCount, 
        Mathf.RoundToInt(((float)src.height / src.width) * xTileCount));

    ...
}
~~~

Using `xTileCount`, we begin by calculating the size of the image after its resolution is decreased. It's easy - we multiply the number of tiles in the x-direction by the aspect ratio of the texture. There's two ways to access the dimensions of the screen here; we'll use the dimensions of the image texture with `src.width` and `src.height`, and we'll see the alternative a little later. Those new image dimensions are used to create a **temporary** `RenderTexture` which will act as an intermediate - its only purpose is to resize the image.

We then change the `FilterMode` of the temporary texture to `Point` - the default is `FilterMode.Bilinear`.

~~~csharp
...
tmp.filterMode = FilterMode.Point;
...
~~~

We're using `Graphics.Blit` to transfer image data from the `src` texture to `tmp`, which has a lower resolution, meaning that some image data is lost. Unity needs to average out a handful of pixels in `src` to determine the colour of each pixel in `tmp` - it works as you'd expect. However, when resizing back up from `tmp` to `dst`, which has the same dimensions as `src`, the default behaviour with `FilterMode.Bilinear` is to interpolate between `tmp` pixels to obtain pixel colours for `dst`. By changing the filter mode to `Point`, it won't perform interpolation and we'll get a blocky output texture.

~~~csharp
Graphics.Blit(src, tmp);
Graphics.Blit(tmp, dst, baseMaterial);
~~~

That's it for `Render`. Now, let's assume `baseMaterial` doesn't modify anything and you'll see screen output like this:

<img data-src="/img/tut3/part3-pixelation.jpg" class="center-image lazyload" alt="Pixelated Image">

<hr/>

# Mosaic Tiles

Now we can get on with writing a shader! This one will overlay a grid texture on top of the image texture to simulate the gaps between tiles where you would see some sort of binding material such as cement. Let's run over the **properties** we'll include. The shader file can be found at `Resources/Shaders/Mosaic.shader`.

~~~glsl
Properties
{
    _MainTex ("Texture", 2D) = "white" {}
    _OverlayTex("Overlay Texture", 2D) = "white" {}
    _OverlayColour("Overlay Colour", Color) = (1, 1, 1, 1)
    _XTileCount("X-axis Tile Count", Int) = 100
    _YTileCount("Y-axis Tile Count", Int) = 100
}
~~~

From top to bottom, we start with `_MainTex`, our image texture, as standard. `_OverlayTex` is a small tileable texture that we'll place over every tile - `_OverlayColour` will let us add a colour tint to the overlay. Then, `_XTileCount` and `_YTileCount` will be the number of tiles in the x- and y-direction respectively. We'll include those just above the fragment shader like this:

~~~glsl
uniform sampler2D _MainTex;
uniform sampler2D _OverlayTex;
uniform float4 _OverlayColour;
uniform int _XTileCount;
uniform int _YTileCount;
~~~

The fragment shader itself is simple. We'll start by sampling the image texture as usual.

~~~glsl
fixed4 frag (v2f i) : SV_Target
{
    fixed4 col = tex2D(_MainTex, i.uv);

    ...

    return col;
}
~~~

After sampling the image texture, we'll need to figure out the UVs for sampling the overlay texture. We passed in `_XTileCount` and `_YTileCount` as parameters for this purpose.

~~~glsl
float2 overlayUV = i.uv * float2(_XTileCount, _YTileCount);
~~~

Determining the colour of the overlay is easy then - just sample the texture and multiply by `_OverlayColour`, which we also passed in by parameter.

~~~glsl
float4 overlayCol = tex2D(_OverlayTex, overlayUV) * _OverlayColour;
~~~

Finally, all we must do is combine the two. It's as simple as using the lerp function using the overlay texture's **alpha channel** as the **proportion** parameter; the overlay texture is mostly empty space with an alpha of zero, so those areas won't have any overlay.

~~~glsl
col = lerp(col, overlayCol, overlayCol.a);
~~~

Our shader is now complete! But we're going to have to return to the script because we haven't finished hooking up all our script variables to the shader. With an `xTileCount` of 75 set on our `MosaicEffect` asset, the overlay will still tile using the default values of 100 in both directions.

<img data-src="/img/tut3/part3-overlay-wrong.jpg" class="center-image lazyload" alt="Overlay Incorrect">

## Putting things in place

We'll include a couple more member variables and make them accessible to the **Inspector**. We need to pass the overlay texture and colour to the shader.

~~~csharp
[SerializeField]
private Texture2D overlayTexture;

[SerializeField]
private Color overlayColour = Color.white;
~~~

And now we'll loop back right to the start of the article and look at the `OnCreate` function.

~~~csharp
// Find the Mosaic shader source.
public override void OnCreate()
{
    baseMaterial = new Material(Resources.Load<Shader>("Shaders/Mosaic"));

    baseMaterial.SetTexture("_OverlayTex", overlayTexture);
    baseMaterial.SetColor("_OverlayColour", overlayColour);
    baseMaterial.SetInt("_XTileCount", xTileCount);
    baseMaterial.SetInt("_YTileCount", 
        Mathf.RoundToInt((float)Screen.height / Screen.width * xTileCount));
}
~~~

It takes the same format as the other `XYZEffect.cs` scripts. We pass in the x- and y-tiling factors for the overlay texture because the alternative is passing in the screen height and calculating the y-tiling amount inside the **fragment shader**, which is less efficient (the y-resolution of the pixelated image snaps to an integer, so we need to do extra calculations here to make sure the overlay image UVs also snap to an 'integer'). In a real-world scenario, you would recalculate the `_YTileCount` whenever the screen is resized, but we'll skip that for simplicity. Now, when you run the shader you'll see the overlay matches exactly with the pixelated image.

<img data-src="/img/tut3/part3-mosaic-complete.jpg" class="center-image lazyload" alt="Overlay Complete">

Looking at the scene using a smaller tile count and at a different angle, you'll get different results:

<img data-src="/img/tut3/part3-mosaic-complete-small.jpg" class="center-image lazyload" alt="Overlay Small">

<hr/>

# Conclusion

Today we've created a masterpiece made of **mosaics**. We made the effect by combining scripting features to shrink the resolution to the size we wanted with shader features to overlay a tiling texture. The result is a mosaic with an easily customisable tiling size and edge colour.

In next week's tutorial, we'll see how to recreate a **red-blue 3D glasses** effect inside Unity!

<hr/>

# Acknowledgements

I'd like to thank my Patreon supporters for making this content possible. [Become a Patron](https://www.patreon.com/danielilett) for $1+ to receive PDF versions of all articles, or $5+ to get certain articles early!

This tutorial series uses the following asset packs - available on the Unity Asset Store:

[Forest - Low Poly Toon Battle Arena / Tower Defense Pack](https://assetstore.unity.com/packages/3d/environments/forest-low-poly-toon-battle-arena-tower-defense-pack-100080) | [**AurynSky**](https://assetstore.unity.com/publishers/17283)

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
