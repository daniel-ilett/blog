---
layout: post
title: Image Effects | Part 6 - Retro Arcade
subtitle: Going back in time for that CRT feel
bigimg: /img/tut1/part6-banner.png
gh-repo: daniel-ilett/smo-shaders-2
gh-badge: [star, fork, follow]
tags: [shaders, unity, image-effects, nes, snes, gb, crt]
nice-slug: Colour Transforms
date: 2019-06-22
---

This tutorial explores the retro console shaders found in Snapshot Mode, which emulate the look and feel of the Nintendo Entertainment System (NES), Super NES (SNES), and Game Boy (GB). We will look into the colour transformations involved and implement an effect that makes the image appear as if it is being displayed on an old-style CRT screen.

<hr/>

![NES Filter](/img/tut1/part6-nes.png)

# NES

The [NES colour palette](https://en.wikipedia.org/wiki/List_of_video_game_console_palettes#NES) is a strange beast. There are 64 colours in its palette, some of which are either duplicates or unusable, leaving 54 effective colours. On top of that, there are three colour emphasis "modes", which arguably pushes the range to 432 colours across 8 modes, although we can only use 54 at a time. Worse for us, these colours are in the YIQ colour space - not RGB. If we wished to emulate the NES colours exactly, we would convert the screen image to YIQ, pick the closest colour in our small range of available colours, then convert back to RGB.

But there's no point in worrying about all this - after all, most of computer graphics is made up of trickery and faking things. Instead, we're going to stay in the RGB colour space. We'll quantise each colour channel from a continuous range between 0.0 and 1.0 into four values - quantisation is the process of mapping some set of values to a smaller set of values - leaving us with 64 possible colours. There's a few more possible colours than the NES could handle, but it won't be noticeable.

Let's look at the template shader file found in `Shaders/PixelNES.shader`. It's very simple - like the old Greyscale and Sepia Tone templates, all this shader does is output the main texture without modification. All our work will be done in the fragment shader - we don't need to add anything to `Properties`.

~~~glsl
fixed4 tex = tex2D(_MainTex, i.uv);

int r = 1;
int g = 1;
int b = 1;

return float4(r, g, b, 1.0);
~~~

We're going to exploit integers to quantise the image. Since we know we want four colours per channel, we'll multiply the individual R, G and B values by four, truncate them to integers, then divide to get our values back into the \[0, 1\] range. I've subtracted a tiny amount - an 'epsilon' value - off the original RGB values during the calculation because otherwise a value of 1.0 would be quantised to 4, but we only want four possible values: 0, 1, 2 and 3. Remember that truncation will turn a floating-point value of 3.999 into an integer value of 3.

~~~glsl
// With other variable definitions.
static const float EPSILON = 1e-10;

// Inside fragment shader.
int r = (tex.r - EPSILON) * 4;
int g = (tex.g - EPSILON) * 4;
int b = (tex.b - EPSILON) * 4;
~~~

We'll then divide each channel by the maximum value - 3 - to obtain the final RGB values.

~~~glsl
return float4(r / 3.0, g / 3.0, b / 3.0, 1.0);
~~~

Run the shader effect by dragging an ImageEffectBase component onto your main camera and attaching the shader - it should result in an effective colour transformation. However, we're missing the pixelated feeling of an old NES game.

## Pixelation

We looked at downsampling an image back in the Blur tutorial. The effect we're looking for is to make our image smaller, perform the colour transformation on the smaller image, then expand the image back to screen size - but if we did this the same way as before, it'd blur the result. As a starting point, we shall do the same as before and then discuss how to avoid the blurring. We'll create a new C# script called `ImageEffectPixelate.cs` and let it inherit from `ImageEffectBase`.

~~~csharp
using UnityEngine;

public class ImageEffectPixelate : ImageEffectBase
{
	[SerializeField]
	private int pixelSize = 2;

	protected override void OnRenderImage(RenderTexture src, RenderTexture dst)
	{
		int width  = src.width / pixelSize;
		int height = src.height / pixelSize;

		RenderTexture temp = 
			RenderTexture.GetTemporary(width, height, 0, src.format);

		// Obtain a smaller version of the source input.
		Graphics.Blit(src, temp);

		Graphics.Blit(temp, dst, material);
	}
}
~~~

So far, the script downsamples, runs the shader on the smaller image, and upsamples it back to normal size. To avoid the interpolation of the `temp` texture when we call the final `Blit()`, we can modify the filter mode of the image - the default setting is `FilterMode.Bilinear`, which we shall change to `FilterMode.Point` right after creating `temp`.

~~~csharp
// Make sure the upsampling does not interpolate.
temp.filterMode = FilterMode.Point;
~~~

Now attach this script to the camera instead of `ImageEffectBase` and insert the `PixelNES` shader. You can change the amount of downsampling by modifying the `pixelSize` in the Inspector - my recommended value is 3. This is looking a lot more like the effect we want.

<hr/>

![SNES Filter](/img/tut1/part6-snes.png)

# SNES

Now let's take a look at the SNES filter. The colour palette was, of course, more advanced than that of the NES - there's now support for 32,768 colours, with 256 at once. However, the hardware also supported additive and subtractive colour blending, so the "256 at once" becomes "any combination of two of those 256 colours at once". It gets very complicated beyond that, so we're going to give each of the three colour channels eight possible colours each, giving us only 216 colours on the screen at once - but it's notieably more than the NES effect, so we'll go with that.

The shader takes exactly the same form as the NES shader, but with different constants in the calculation. Open up `Shaders/PixelSNES.shader` and modify the fragment shader.

~~~glsl
fixed4 tex = tex2D(_MainTex, i.uv);

int r = (tex.r - EPSILON) * 6;
int g = (tex.g - EPSILON) * 6;
int b = (tex.b - EPSILON) * 6;

return float4(r / 5.0, g / 5.0, b / 5.0, 1.0);
~~~

Looking good so far! Together with `ImageEffectPixelate`, the effect is looking quite strong. However, I think we can go one step further with the effect - NES and SNES games were played on CRTs, which certainly don't look this crisp.

## CRT

CRT stands for "cathode ray tube"; a CRT TV uses one of these to fire electrons into a phosphorescent screen to generate light and, by extension, images. There are three colours of phosphor used - red, green and blue - which is very convenient for us. Images are produced by scanning left-to-right, top-to-bottom, row-by-row, until all pixels have been displayed, then the process starts over again. The gaps between the phosphor zones and the action of the CRT scanning along rows means that visible scanlines appear horizontally on the screen. What we're going to do is split the screen into those phosphor zones with a dead zone where the scanlines would appear - in effect, the screen will be segmented into 3x3 sections, with three 1x2 vertical lines for each of red, green and blue, with a 3x1 black horizontal line below them. We'll multiply the source image by this 'grid' to obtain the final image.

<hr/>

![GB Filter](/img/tut1/part6-gb.png)

# Gameboy

<hr/>

# Conclusion

We've looked into some relatively simple shaders that only considered pixels one-at-a-time, but are more in-depth than the Greyscale shaders from before. Perhaps you now have more of an appreciation for the difference between CRT and LCD screens, too. In the next tutorial, we'll use a new type of kernel function to imitate the Oil Painting effect.

<hr/>
