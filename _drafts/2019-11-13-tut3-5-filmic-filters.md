---
layout: post
title: Ultra Effects | Part 5 - Filmic Filters
subtitle: Noisy grain and cinematic bars
bigimg: /img/tut3/part5-banner.jpg
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, filmic, cinematic, noise]
nice-slug: Filmic Filters
date: 2019-11-13
idnum: 28
---

Several games could be described as 'cinematic'. Usually, that means heavy application of film techniques to deliver the story or narrative of the game, although interpretations of the term differ - it's very subjective. It could mean throwing a film grain effect over the screen and using black bars to force the viewport into a wider aspect ratio. It might mean lots of cutscenes. And in this tutorial, we'll take it to mean the first - film grain and black bars! Many of these effects emulate the imperfections of cameras or photographic film, so today we're going to use a **noise function** to recreate the film grain effect.

![Film Camera](/img/tut3/part5-film-camera.jpg){: .center-image }

[Photo by Donald Tong on Pexels](https://www.pexels.com/@donaldtong94)

<hr/>

# Imperfect Film

Before the age of digital film, each frame of a motion picture was captured on sections of a physical photographic film strip. The strip was coated with a thin emulsion containing **silver halide** crystals, which, alongside special dyes, react to light and form the image to be projected. It is those crystals and their varying sizes and distribution across the emulsion layer that cause **film grain** - the appearance of noise and texture on the base image. They also influence the image resolution. In digital photography, these artefacts no longer appear, although they can be digitally recreated and simulated - for some, a generated film grain effect is preferable to a "sterile" digital image.

In this tutorial, we'll create our own noise to overlay on our images. While we could slap any noise function on the image and call it a day, we'll pay special attention to **Perlin noise**. 

## Perlin Noise

When Ken Perlin was tasked with procedurally generating textures for the sci-fi movie *Tron*, he came up with a noise algorithm that would lead to him winning an Academy Award for contributions to CGI - that algorithm was **Perlin Noise**. The algorthm generates a grid of random vectors and then does some fancy stuff to end up with a smooth cloud-like texture. We'll step through the algorithm in detail while implementing it inside a shader.

Let's kick of straight away with the shader, found at *Resources/Shaders/Cinematic.shader*. We'll need a handful of properties to start off with.

~~~glsl
_MainTex ("Texture", 2D) = "white" {}
_Strength("Noise Strength", Float) = 0.1
_Aspect("Aspect Ratio", Float) = 1.777
~~~

As with all image effects, we'll need `_MainTex`. On top of that, we'll have a _Strength property to control the amount of **film grain**, plus an `_Aspect` property to control the desired **aspect ratio** of the screen - we'll add black film bars above and below the screen to make the image fit this aspect ratio. It's represented as a decimal - here, the widescreen standard 16:9 aspect ratio is equal to 1.777 as a decimal.

The next thing we'll need is a function to generate random numbers. There's no point in reinventing the wheel here - there's a [pseudorandom function](https://stackoverflow.com/questions/12964279/whats-the-origin-of-this-glsl-rand-one-liner) commonly used in shaders with a handful of variations, so we'll use that. This function collapses a 2D value into a single number - that's ideal for us.

The one change I'm making to this function is to implement a time-sensitive component, as we'll need our film grain to change each frame. Unity provides a built-in `_Time` variable which includes the time since the game started in four different formats: t/20, t, 2t and 3t. `_Time.y` will give us unscaled time.

~~~glsl
// Generate time-sensitive random numbers.
float rand(float2 st)
{
    return frac(sin(dot(st + float2(_Time.y, _Time.y), 
        float2(12.9898f, 78.233f))) * 43758.5453123f);
}
~~~

Now let's talk about the Perlin noise function in an abstract sense. 

![Film Grain](/img/tut3/part5-film-grain-anim.gif){: .center-image }

![Film Bars](/img/tut3/part5-film-grain-bars.jpg){: .center-image }

![Greyscale Film](/img/tut3/part5-film-greyscale.jpg){: .center-image }

![Sepia Film](/img/tut3/part5-film-sepia.jpg){: .center-image }

# Acknowledgements

I'd like to thank my Patreon supporters for making this content possible. [Become a Patron](https://www.patreon.com/danielilett) for $1+ to receive PDF versions of all articles, or $5+ to get certain articles early!

This tutorial series uses the following asset packs - available on the Unity Asset Store:

[Forest - Low Poly Toon Battle Arena / Tower Defense Pack](https://assetstore.unity.com/packages/3d/environments/forest-low-poly-toon-battle-arena-tower-defense-pack-100080) | [**AurynSky**](https://assetstore.unity.com/publishers/17283)

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
