---
layout: post
title: Image Effects - Part 1 - Colour Transforms
subtitle: Emulating Odyssey's Greyscale and Sepia Tone effects in Unity
bigimg: /img/tut1/part1-banner.png
tags: [shaders, unity]
nice-slug: Colour Transforms
date: 2019-04-12 01:00:00
---
This tutorial discusses two fairly simple effects seen in Snapshot Mode - Greyscale and Sepia Tone. Both of these effects require nothing more than just modifying the input colour of each pixel individually. By the end of this tutorial, you should understand the basics of manipulating colours in shaders in Unity.

# Greyscale Filter

![Greyscale Filter](/img/tut1/part1-greyscale.png)

The Greyscale filter is one of the simplest filters used in Super Mario Odyssey. The effect operates on each individual pixel of the image independently of all others, and it’s a simple linear transformation from one domain of values to another. To understand how to convert to greyscale, we need to first understand how the eyes perceive and process colour.

Assuming no additional effects like color blindness or tetrachromacy, the human eye detects three colours - red, green and blue - corresponding to three types of cone cell in the eye. The eye is more sensitive to green light than red or blue, which our greyscale conversion must take into account. Essentially, we calculate a luminance value for each pixel - keeping those different sensitivities in mind - and use that as our greyscale value. Our shader needs to output an RGB vector rather than just one value, but conveniently, a greyscale pixel is one that has the same value for each of those three channels.

The conversion to a single luminance value looks a little like this:

~~~
float lum = tex.r * 0.3 + tex.g * 0.59 + tex.b * 0.11;
~~~

# Sepia Tone Filter

![Sepia-tone Filter](/img/tut1/part1-sepia.png)

The sepia tone filter aims to emulate the yellowing effect seen on some old-timey photographs - this means the filter is a little more involved than the Greyscale effect. Because the end result isn't greyscale, it’s not sufficient to find a single luminance value - each of the input red, green and blue channels will feed into the resulting red channel, and each input feeds into the output green, and so on. For that, we’ll need a matrix of coefficients, instead of a simple vector, as seen in the previous image effect. We can multiply the input RGB values of each pixel with this matrix to obtain three values - our output RGB values:

~~~
half3x3 sepiaVals = half3x3
(
    0.393, 0.349, 0.272,    // Red
    0.769, 0.686, 0.534,    // Green
    0.189, 0.168, 0.131     // Blue
);

half3 sepiaResult = mul(tex.rgb, sepiaVals);
~~~

# Conclusion

You’ve had a taste of the power of image effects in Unity. We’ve only talked about simple colour transformations so far and introduced vector and matrix operations - next time, we’ll be implementing blurring algorithms, which take into account neighbouring pixels when calculating each pixel’s colour value.
