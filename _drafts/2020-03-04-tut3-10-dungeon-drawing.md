---
layout: post
title: Ultra Effects | Part 10 - Dungeon Drawing
subtitle:
bigimg: /img/tut3/part10-bigimg.jpg
hdrimg: /img/tut3/part10-banner.jpg
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects]
nice-slug: Dungeon Drawing
date: 2020-03-04
idnum: 40

part-label: 10
series-name: Ultra Effects
---

*Pokémon Mystery Dungeon* evokes a lot of nostalgia from fans of the series. With *Rescue Team DX* releasing this Friday, it's a good time to break down the gorgeous hand-drawn effect used in the game. Today, we'll write an improved edge detection shader over the ones we've written before and then create a separate 'drawing' effect that makes the whole scene look like it's shaded with a pencil. Twitter user Jose Pacio created [a very similar effect](https://twitter.com/ImPACIOble/status/1226710964323569664) last month!

<img data-src="/img/tut3/part10-mystery-dungeon.jpg" class="center-image lazyload" alt="Mystery Dungeon">

Screenshot from *Pokémon Mystery Dungeon: Rescue Team DX*.

<hr/>

# Edge Detection

*Mystery Dungeon* uses bold, cartoonish outlines to make characters and scenery stand out. We have covered edge detection algorithms on this website in the past, but we focused only on a basic Sobel edge detector operating only on the image colours. That's not the only information available to a shader. There are three sources of information we can draw on: colour, depth information and normal vectors. And as it turns out, we can do almost the same thing with all three bits of information - for each pixel in the image, we can sample the adjacent four pixels (up, down, left and right) and calculate an image gradient in order to determine how 'edgy' the pixel is. By swapping out which image we are sampling from - the colour buffer, depth buffer or normal buffer - we can create a shader that combines knowledge from all three.

Let's go over the basic strategy. We'll sample the image in a cross pattern - many tutorials use the [Roberts Cross](https://en.wikipedia.org/wiki/Roberts_cross) operator which operates on diagonals, but I had better results when using a plus shape. We'll take the difference between the pixel value above and below, and the difference between the pixel value to the left and the right, then use those to calculate the magnitude of the gradient across the centre pixel. By thresholding the gradient magnitude, we can determine whether a pixel is on an edge.

## Colour-based Edges

let's jump into specifics. The shader for the **Outline** effect can be found at *Resources/Shaders/Outline.shader* in the [project repository on GitHub](https://github.com/daniel-ilett/image-ultra). First, we'll include the colour buffer - `_MainTex` - and its `_TexelSize` data. Alongside it, we'll include two parameters: `_ColorSensitivity` to control the threshold over which an edge is considered to be an edge, and `_ColorStrength` to control how strong colour-based edges will be. We're allowing all three methods of edge detection to have different thresholds and strengths, so if you want depth-based edges to be more prevalent, or for colour-based edges to be weaker, you'll be able to do so.

~~~glsl
sampler2D _MainTex;
float4 _MainTex_TexelSize;
...
float _ColorSensitivity;
float _ColorStrength;
~~~

All edge detection in the fragment shader will overlay visible edges onto the main texture. We'll start off by sampling `_MainTex` with unmodified UV coordinates. Also, the four gradient sampling points are the same for all three edge detection methods, so we'll define the four UV sampling positions here. We can use `_TexelSize` to obtain the coordinates of adjacent pixels.

~~~glsl
float4 col = tex2D(_MainTex, i.uv);

float2 leftUV = i.uv + float2(-_MainTex_TexelSize.x, 0);
float2 rightUV = i.uv + float2(_MainTex_TexelSize.x, 0);
float2 bottomUV = i.uv + float2(0, -_MainTex_TexelSize.y);
float2 topUV = i.uv + float2(0, _MainTex_TexelSize.y);
~~~

Now we have our four sampling points, we can start sampling the colour buffer. When I mention the 'colour buffer', I am referring to the image/screen texture - `_MainTex`.

~~~glsl
float3 col0 = tex2D(_MainTex, leftUV).rgb;
float3 col1 = tex2D(_MainTex, rightUV).rgb;
float3 col2 = tex2D(_MainTex, bottomUV).rgb;
float3 col3 = tex2D(_MainTex, topUV).rgb;
~~~

With these samples, we'll calculate the gradient in the x-direction and in the y-direction.

~~~glsl
float3 c0 = col1 - col0;
float3 c1 = col3 - col2;
~~~

Then we can use Pythagoras' Theorem to calculate the overall gradient strength and store it in a variable called `edgeCol`. Once we have calculated the gradient, we'll compare it to the `_ColorSensitivity` defined previously. If `edgeCol` is greater than the threshold, we'll set `edgeCol` to the `_ColorStrength` value we also defined previously. Otherwise, `edgeCol` is zero.

~~~glsl
float edgeCol = sqrt(dot(c0, c0) + dot(c1, c1));
edgeCol = edgeCol > _ColorSensitivity ? _ColorStrength : 0;
~~~

We haven't written a script to drive the effect yet - we'll have that all at the end - but as a sneak peak, let's see what happens when we view an edge detection algorithm that only takes into account colours.

<img data-src="/img/tut3/part10-colour-edge.jpg" class="center-image lazyload" alt="Colour-based Edges">

So far so good - we've got bold edges between differently-coloured regions of the image. However, we might not want to rely on this type of edge detector, as it returns strange results on shadowed areas of the image - as you can see below the catapult - and might not detect an edge where an object is placed in front of a similarly-coloured object, like some of the bushes in this image. We'll need additional information to draw edges here.

## Depth-based Edges

The second source of data is the depth buffer. We have also [used the depth buffer before](https://danielilett.com/2019-05-08-tut1-3-smo-blur/) on this website, but we haven't used it for drawing edges before. We have access to the camera's depth texture (which itself is a representation of the depth buffer) via `_CameraDepthTexture`, which we will include above the fragment shader with the other parameters alongside `_DepthSensitivity` and `_DepthStrength`, like the parameters we defined for colour-based edges.

~~~glsl
sampler2D _CameraDepthTexture;
...
float _DepthSensitivity;
float _DepthStrength;
~~~

Continuing on below the code we wrote for colour-based edge detection, we'll sample the depth texture using the same four sampling points. We can sample from this texture like any other and grab just the red channel value because the image is greyscale and all we need is a single `float` to represent depth.

~~~glsl
float depth0 = tex2D(_CameraDepthTexture, leftUV).r;
float depth1 = tex2D(_CameraDepthTexture, rightUV).r;
float depth2 = tex2D(_CameraDepthTexture, bottomUV).r;
float depth3 = tex2D(_CameraDepthTexture, topUV).r;
~~~

We'll add an extra step here to convert the depth values to a linear range between 0 and 1. Depth values read directly from the depth buffer typically are not linear between the near and far clipping planes of the camera, but for our edge detection algorithm we want them to be (the algorithm will still work fine with non-linear depth values, but I think the effect looks better with this linearisation step). Unity provides the `Linear01Depth` function for this purpose.

~~~glsl
depth0 = Linear01Depth(depth0);
depth1 = Linear01Depth(depth1);
depth2 = Linear01Depth(depth2);
depth3 = Linear01Depth(depth3);
~~~

Now we can calculate gradients in exactly the same way as we did with the colour-based edge detection step. We'll use `_DepthSensitivity` and `_DepthStrength` to control how sensitive the edge detection is and how strong the edges are respectively.

~~~glsl
float d0 = depth1 - depth0;
float d1 = depth3 - depth2;

float edgeDepth = sqrt(d0 * d0 + d1 * d1);
edgeDepth = edgeDepth > _DepthSensitivity ? _DepthStrength : 0;
~~~

Let's take a sneak peak at what the effect would look like with only depth-based edges.

<img data-src="/img/tut3/part10-depth-edge.jpg" class="center-image lazyload" alt="Depth-based Edges">

Even with quite a low threshold value of 0.01, it's quite difficult to detect depth-based edges where object intersect other objects, for example objects on the ground. We'll need to combine the results of this with the third and final technique.

## Normal-based Edges

Alongside the depth texture, Unity is able to generate a normals texture which stores the direction each pixel is 'facing' in 3D space. This is useful for us for detecting objects placed on the ground - the difference in the normal vectors of pixels near the contact point will be quite large. We'll need to instruct Unity to generate this texture inside a script, which we'll deal with later. For now, let's add `_CameraDepthNormalsTexture`, `_NormalsSensitivity` and `_NormalsStrength` to our properties section of the shader.

~~~glsl
sampler2D _CameraDepthNormalsTexture;
...
float _NormalsSensitivity;
float _NormalsStrength;
~~~

We'll sample the texture to grab the four normal vectors like we did for the other two techniques. The notable difference here is that normal vectors are three-dimensional, as are the gradient values in the x- and y-directions.

~~~glsl
float3 normal0 = tex2D(_CameraDepthNormalsTexture, leftUV).rgb;
float3 normal1 = tex2D(_CameraDepthNormalsTexture, rightUV).rgb;
float3 normal2 = tex2D(_CameraDepthNormalsTexture, bottomUV).rgb;
float3 normal3 = tex2D(_CameraDepthNormalsTexture, topUV).rgb;

float3 n0 = normal1 - normal0;
float3 n1 = normal3 - normal2;
~~~

Because we're working with directions in 3D space rather than scalar values, we can't just multiply the gradients together during the Pythagoras calculation - we must use the `dot` product instead. In this context, it acts much the same way - performing the dot product on a vector with itself will return the squared magnitude of the vector. Then, we'll use `_NormalsSensitivity` and `_NormalsStrength` for thresholding and strength respectively.

~~~glsl
float edgeNormal = sqrt(dot(n0, n0) + dot(n1, n1));
edgeNormal = edgeNormal > _NormalsSensitivity ? _NormalsStrength : 0;
~~~

Let's see what the effect looks like with only normals-based edge detection.

<img data-src="/img/tut3/part10-normals-edge.jpg" class="center-image lazyload" alt="Normal-based Edges">

This is great! Edges show up really well in general. However, the effect does fall flat when a section of the image obscures another section which is perpendicular, like the pool of water at the front of this image. It's clear we'll need to combine these approaches.

## Combining Techniques

It's very easy to combine the three techniques. We have a shader which can calculate all three, so we'll store the maximum of `edgeCol`, `edgeDepth` and `edgeNormal` in a new variable called `edge`. We'll use the `edge` value to overlay a visible edge over the image, which is as simple as multiplying the original image sample, `col`, by (1 - `edge`).

~~~glsl
float edge = max(max(edgeCol, edgeDepth), edgeNormal);
return col * (1.0f - edge);
~~~

Let's see what that looks like. I prefer to set the sensitivity of the colour- and normals-based detection to 0.1 and use 0.01 for the depth-based detection, then make the colour-based detection strength a little less than the other two methods - values of 0.5 and 0.75 work well for a softer look overall.

<img data-src="/img/tut3/part10-combined-edge.jpg" class="center-image lazyload" alt="Combined Edges">

Play around with the values to get the effect you want! Let's create a script to drive the effect - you can find this at *Scripts/Image Effects/Outline.cs*. It starts off by defining the six variables we used for controlling sensitivity and strength.

~~~csharp
[SerializeField]
private float colorSensitivity = 0.1f;

[SerializeField]
private float colorStrength = 1.0f;

[SerializeField]
private float depthSensitivity = 0.1f;

[SerializeField]
private float depthStrength = 1.0f;

[SerializeField]
private float normalsSensitivity = 0.1f;

[SerializeField]
private float normalsStrength = 1.0f;
~~~

In the `Render` method, the script must send those values to the shader using the SetFloat method.

~~~csharp
baseMaterial.SetFloat("_ColorSensitivity", colorSensitivity);
baseMaterial.SetFloat("_ColorStrength", colorStrength);
baseMaterial.SetFloat("_DepthSensitivity", depthSensitivity);
baseMaterial.SetFloat("_DepthStrength", depthStrength);
baseMaterial.SetFloat("_NormalsSensitivity", normalsSensitivity);
baseMaterial.SetFloat("_NormalsStrength", normalsStrength);
~~~

You'll also recall earlier in this tutorial that I mentioned we'll need to tell the camera to generate the normal texture? This is where we'll do it - right before calling `Graphics.Blit`. We'll change the camera's `depthTextureMode` setting to use `DepthTextureMode.DepthNormals`.

~~~csharp
Camera.main.depthTextureMode = DepthTextureMode.DepthNormals;
Graphics.Blit(src, dst, baseMaterial);
~~~

That's all we need for the script. By creating a new **Outline** effect asset (or attaching the one at *Effects/Outline.asset* to the camera image effect script), you'll be able to see the effect for yourself in the Unity Editor.

<hr/>

# Drawing Overlay

The **Outline** effect by itself is very striking but we can do better. In *Mystery Dungeon*, the shadows below certain objects and characters appear as if they are sketched onto the scene using a pencil - we'll go the whole hog and make the entire scene look hald-drawn based on the luminance of the base image. The brighter the original pixel, the less apparent the sketch effect will be. The simplest way of achieving a sketch aesthetic is to create a sketch texture containing an arrangement of pencil/brush strokes, then overlaying it onto the image with differing transparency.

<img data-src="/img/tut3/part10-drawing-texture.jpg" class="center-image lazyload" alt="Drawing Texture">

Let's create the shader. Open *Resources/Shaders/Drawing.shader*. Alongside `_MainTex`, we'll need the drawing texture, `_DrawingTex`. We're also going to consider several other features. If we don't want the background colour to be influenced by the drawing effect, we can ignore the drawing texture past a depth threshold - for that we'll need `_CameraDepthTexture` and a `_DepthThreshold` `float` value between 0 and 1. We're going to animate the drawing effect over time by shifting its UVs - for that, we'll use a `float` called `_OverlayOffset`. We will, of course, need a `_Strength` value, as well as a `_Tiling` value to control how large the brush strokes are. Finally, we'll add the ability to smudge the colours slightly in the direction of the brush strokes using a `_Smudge` value.

~~~glsl
sampler2D _MainTex;
sampler2D _DrawingTex;
sampler2D _CameraDepthTexture;

float _OverlayOffset;
float _Strength;
float _Tiling;
float _Smudge;
float _DepthThreshold;
~~~

That looks like a lot of features, but the fragment shader is fairly short! We'll start by calculating the UVs to use for the drawing texture. It will be influenced by the amount of `_Tiling` and the `_OverlayOffset`. Furthermore, we'll need to consider how to map a square texture onto a rectangular screen - we'll multiply by the aspect ratio (which we can calculate using `_ScreenParams`) to prevent the drawing overlay getting stretched over the screen.

~~~glsl
float2 drawingUV = i.uv * _Tiling + _OverlayOffset;
drawingUV.y *= _ScreenParams.y / _ScreenParams.x;
~~~

Now, we'll sample the drawing texture. However, we'll easily notice patterns in the texture if we sample once. Instead, we're going to sample using these UVs and then sample *again* after dividing the UVs by 3, then take the average of both samples to get a much more complex (and, as it turns out, nicer-looking) pattern.

~~~glsl
float4 drawingCol = (tex2D(_DrawingTex, drawingUV) + 
	tex2D(_DrawingTex, drawingUV / 3.0f)) / 2.0f;
~~~

Next up, we'll sample the main texture. To add our `_Smudge`, we'll add a small offset based on the `drawingCol` (which is a greyscale texture) - any white portions of the drawing texture will cause the corresponding pixels to shift, whereas black sections will keep the main texture in the same position. The effect will be an extra layer of jitter to add to the hand-drawn look of the scene.

~~~glsl
float2 texUV = i.uv + drawingCol * _Smudge;
float4 col = tex2D(_MainTex, texUV);
~~~

Then, we'll calculate the image luminance using the same calculation we've used a thousand times before. Based on the luminance, we'll choose between preserving the image colour as it is and multiplying it by the drawing texture - we'll use the `lerp` function for this, and use both the luminance and the `_Strength` as our interpolation factor. We'll need to subtract the luminance from 1 to make the effect work as intended.

~~~glsl
float lum = dot(col, float3(0.3f, 0.59f, 0.11f));
float4 drawing = lerp(col, drawingCol * col, (1.0f - lum) * _Strength);
~~~

Finally, we'll take into account the pixel depth. If we decide the scene stands out better without a textured sky, we can ignore the effect of the drawing texture for depth values over a threshold. If the depth value is below the threshold, we'll use the modified image texture - else, we'll just return `col`.

~~~glsl
float depth = tex2D(_CameraDepthTexture, i.uv).r;
depth = Linear01Depth(depth);

return depth < _DepthThreshold ? drawing : col;
~~~

That's it for the shader! Let's handle the `Drawing` script to drive the effect, found at *Scripts/Image Effects/Drawing.cs*. We'll start off by defining all of the variables we need to pass over to the shader. Most have the same names as above - the only differece is the inclusion of a `shiftCycleTime` variable, which denotes how long it takes for each animation cycle of the drawing effect. The animation is super simple - the UVs of the drawing texture will shift by 0.5 in both the u- and v-directions at the halfway-point of each cycle.

~~~csharp
[SerializeField]
private Texture2D drawingTex;

[SerializeField]
private float shiftCycleTime = 1.0f;

[SerializeField]
private float strength = 0.5f;

[SerializeField]
private float tiling = 10.0f;

[SerializeField]
private float smudge = 1.0f;

[SerializeField]
private float depthThreshold = 0.99f;
~~~

Then, in `Render`, we can calculate whether the overlay will be offset based on `Time.time` - the real time since the game started.

~~~csharp
bool isOffset = (Time.time % shiftCycleTime) < (shiftCycleTime / 2.0f);
~~~

The rest of `Render` involves sending over the other parameters.

~~~csharp
if (drawingTex != null)
{
    baseMaterial.SetTexture("_DrawingTex", drawingTex);
}

baseMaterial.SetFloat("_OverlayOffset", isOffset ? 0.5f : 0.0f);
baseMaterial.SetFloat("_Strength", strength);
baseMaterial.SetFloat("_Tiling", tiling);
baseMaterial.SetFloat("_Smudge", smudge);
baseMaterial.SetFloat("_DepthThreshold", depthThreshold);
~~~

That's all for the script - now we can see the drawing effect in action by attaching *Effects/Drawing.asset* to our camera!

<img data-src="/img/tut3/part10-drawing-overlay.jpg" class="center-image lazyload" alt="Drawing Overlay">

As expected, darker colours appear more 'sketchy' than light areas - in fact, the near-white portions barely look textured. To really see this effect at its peak, we'll need to see it animated and with the outline effect applied too:

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut3/part10-effect-complete.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

When combined with the outline (as you can see if you attach *Effects/MysteryDungeon.asset* to your camera), both shaders produce a striking effect! Finally, we can add a Pikachu model to the scene - he looks so happy!

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut3/part10-pikachu.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

<hr/>

# Conclusion

Based on the cartoon drawing aesthetic of *Pokémon Mystery Dungeon: Rescue Team DX*, we've created a bold, highly customisable outline effect, combined with an artistic pencil stroke overlay. Together, the entire scene looks like it's torn straight out of an artbook!

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
