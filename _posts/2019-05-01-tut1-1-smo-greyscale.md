---
layout: post
title: Image Effects | Part 1 - Colour Transforms
subtitle: Emulating Odyssey's Greyscale and Sepia Tone effects in Unity
bigimg: /img/tut1/part1-banner.png
gh-repo: daniel-ilett/smo-shaders
gh-badge: [star, fork, follow]
tags: [shaders, unity, image-effects, greyscale, sepia]
nice-slug: Colour Transforms
date: 2019-05-01
idnum: 4
---

This tutorial discusses two simple effects seen in Snapshot Mode - Greyscale and Sepia Tone. Both effects require nothing more than just modifying the colour of each pixel individually. By the end of this tutorial, you should understand the basics of manipulating colours in shaders in Unity.

<hr/>

![Greyscale Filter](/img/tut1/part1-greyscale.png)

# Greyscale Filter

The Greyscale filter is one of the simplest filters in Snapshot Mode. The effect operates on each individual pixel of the image independently of all others, and it’s a simple linear transformation from RGB colours to greyscale values. To understand how to convert to greyscale, we need to first understand how the eyes perceive and process colour.

Assuming no additional effects like colour-blindness or tetrachromacy, the human eye detects three colours - red, green and blue - corresponding to three types of cone cell in the eye. The eye is more sensitive to green light than red or blue, which our greyscale conversion must consider. We'll calculate a luminance value for each pixel, keeping the different RGB sensitivities in mind, and use those to determine a greyscale value - since luminance is a measure of lightness, we'll just use that value without modification. Conveniently, a greyscale colour is one that has the same value for each of the red, green and blue colour channels, so once we have obtained a luminance value, we're essentially done.

Without going into detail about how the coefficients are obtained, the luminance calculation like this:

~~~glsl
float lum = tex.r * 0.3 + tex.g * 0.59 + tex.b * 0.11;
~~~

We can tie this formula into the image effect skeleton we developed in the Shader Primer. If you downloaded the project source code, you'll find a template for this shader in `Shaders/Greyscale.shader`. If we use this function inside the fragment shader, then we can convert our input image into greyscale:

~~~glsl
float4 frag(v2f_img i) : COLOR
{
    float4 tex = tex2D(_MainTex, i.uv);

    // Constants represent human eye sensitivity to each colour.
    float lum = tex.r * 0.3 + tex.g * 0.59 + tex.b * 0.11;
    float4 result = float4(lum, lum, lum, tex.a);

    return result;
}
~~~

If you followed the shader primer, you'll notice the struct passed into this fragment shader, `v2f_img`, is slightly different to the one described in the primer; this one is predefined in `UnityCG.cginc`, so there's no need to reimplement it ourselves. There's also no vertex shader definition in the template file, since `UnityCG.cginc` defines one called `vert_img`. For our image effects, there isn't much use in redefining the vertex shader, because it is the most basic type; the interesting processing we do is all found in the fragment shader.

<hr/>

![Sepia-tone Filter](/img/tut1/part1-sepia.png)

# Sepia Tone Filter

The sepia tone filter aims to emulate the yellowing effect seen on some old-timey photographs - this means the filter is a little more involved than the Greyscale effect. Because the result isn't greyscale, it’s not sufficient to find a single luminance value - each of the input red, green and blue channels will feed into the output red channel, and each input feeds into the output green, and so on. For that, we’ll need a matrix of coefficients, instead of a simple vector, as seen in the previous image effect. We can multiply the input RGB values of each pixel with this matrix to obtain our output RGB values.

~~~glsl
half3x3 sepiaVals = half3x3
(
    0.393, 0.349, 0.272,    // Red
    0.769, 0.686, 0.534,    // Green
    0.189, 0.168, 0.131     // Blue
);

half3 sepiaResult = mul(tex.rgb, sepiaVals);
~~~

From there, it's a short step to using that value as the output of the fragment shader.

~~~glsl
return half4(sepia, tex.a);
~~~

If you're looking to further your shader-writing skills, I'd recommend brushing up on your linear algebra - stuff like vector and matrix operations - before going too deep. There are tons of crash-courses available online; [this one](http://metalbyexample.com/linear-algebra/) seems to cover the important topics.

## A small note about floating-points

As mentioned, the keywords `float`, `fixed` and `half` all denote floating-point numbers of different precision. You'll have noticed that the Greyscale fragment shader used `float`, while the Sepia Tone fragment shader used `half`; both can represent colours, so both are valid in this context. In fact, on most desktop and laptop GPU hardware, there is [absolutely no difference](https://docs.unity3d.com/Manual/SL-DataTypesAndPrecision.html) between the types; they're often all taken to mean full 32-bit precision unless they are being used on mobile GPUs.

<hr/>

# Conclusion

You’ve had a taste of the power of image effects in Unity. We’ve only talked about simple colour transformations so far and introduced vector and matrix operations - next time, we’ll be exploring buffers other than the framebuffer to help us recreate the Silhouette effect.

<hr/>
